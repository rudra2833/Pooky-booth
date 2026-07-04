import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useWebRTC - Direct RTCPeerConnection implementation.
 * Replaces simple-peer entirely to fix:
 *   - P2P Error on localhost (same-machine tabs)
 *   - Buffer is not defined crashes
 *   - Unified-plan / loopback ICE failures
 */
export const useWebRTC = (socket, role, localStream, partnerConnected) => {
  const [remoteStream, setRemoteStream] = useState(null);
  const [rtcStatus, setRtcStatus] = useState('disconnected');
  const [rtcError, setRtcError] = useState(null);

  const pcRef = useRef(null);
  const pendingCandidates = useRef([]);
  const remoteDescSet = useRef(false);

  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ];

  const destroyPeer = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    pendingCandidates.current = [];
    remoteDescSet.current = false;
  }, []);

  // Apply any buffered ICE candidates once remote description is set
  const flushCandidates = useCallback(async () => {
    if (!pcRef.current || !remoteDescSet.current) return;
    while (pendingCandidates.current.length > 0) {
      const candidate = pendingCandidates.current.shift();
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn('Failed to add buffered ICE candidate:', e);
      }
    }
  }, []);

  // Main setup effect
  useEffect(() => {
    if (!socket || !partnerConnected || !localStream) {
      destroyPeer();
      setRemoteStream(null);
      setRtcStatus('disconnected');
      return;
    }

    const isLeader = role === 'leader';
    console.log(`[WebRTC] Setting up as ${isLeader ? 'LEADER (offerer)' : 'PARTNER (answerer)'}`);
    setRtcStatus('connecting');
    setRtcError(null);

    // Create RTCPeerConnection
    const pc = new RTCPeerConnection({
      iceServers,
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    });
    pcRef.current = pc;

    // Add local tracks
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    // Receive remote stream
    pc.ontrack = (event) => {
      console.log('[WebRTC] Remote track received');
      setRemoteStream(event.streams[0]);
      setRtcStatus('connected');
    };

    // Send ICE candidates to peer via socket
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] Sending ICE candidate');
        socket.emit('signal', { type: 'candidate', candidate: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log('[WebRTC] Connection state:', state);
      if (state === 'connected') {
        setRtcStatus('connected');
        setRtcError(null);
      } else if (state === 'failed' || state === 'disconnected' || state === 'closed') {
        setRtcStatus('error');
        setRtcError(`WebRTC connection ${state}`);
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log('[WebRTC] ICE gathering state:', pc.iceGatheringState);
    };

    // Handle incoming signals from socket
    const handleSignal = async (data) => {
      if (!pcRef.current) return;
      try {
        if (data.type === 'offer') {
          console.log('[WebRTC] Received offer, setting remote desc and sending answer');
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
          remoteDescSet.current = true;
          await flushCandidates();
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          socket.emit('signal', pcRef.current.localDescription);

        } else if (data.type === 'answer') {
          console.log('[WebRTC] Received answer, setting remote desc');
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
          remoteDescSet.current = true;
          await flushCandidates();

        } else if (data.type === 'candidate') {
          if (remoteDescSet.current) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          } else {
            console.log('[WebRTC] Buffering ICE candidate (no remote desc yet)');
            pendingCandidates.current.push(data.candidate);
          }
        }
      } catch (err) {
        console.error('[WebRTC] Signal handling error:', err);
        setRtcStatus('error');
        setRtcError(err.message);
      }
    };

    socket.on('signal', handleSignal);

    // Leader creates and sends the offer
    if (isLeader) {
      (async () => {
        try {
          console.log('[WebRTC] Creating offer...');
          const offer = await pc.createOffer({
            offerToReceiveVideo: true,
            offerToReceiveAudio: false,
          });
          await pc.setLocalDescription(offer);
          socket.emit('signal', pc.localDescription);
          console.log('[WebRTC] Offer sent');
        } catch (err) {
          console.error('[WebRTC] Failed to create offer:', err);
          setRtcStatus('error');
          setRtcError(err.message);
        }
      })();
    }

    return () => {
      console.log('[WebRTC] Cleanup');
      socket.off('signal', handleSignal);
      destroyPeer();
      setRemoteStream(null);
      setRtcStatus('disconnected');
    };
  }, [socket, role, localStream, partnerConnected, destroyPeer, flushCandidates]);

  return { remoteStream, rtcStatus, rtcError };
};
