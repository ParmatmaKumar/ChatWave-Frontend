
import {
    useEffect,
    useRef,
    useState,
} from "react";


const useWebRTC = (socket, currentUser) => {

    // ==============================
    // STATES
    // ==============================

    const [incomingCall, setIncomingCall] =
        useState(null);

    const [isCalling, setIsCalling] =
        useState(false);

    const [isInCall, setIsInCall] =
        useState(false);

    const [callType, setCallType] =
        useState(null);


    // ==============================
    // REFS
    // ==============================

    const peerConnection =
        useRef(null);

    const localStream =
        useRef(null);

    const remoteStream =
        useRef(null);

    const localVideo =
        useRef(null);

    const remoteVideo =
        useRef(null);

    const remoteUserId =
        useRef(null);

    const pendingOffer =
        useRef(null);

    const pendingCandidates =
        useRef([]);


    // ==============================
    // WEBRTC CONFIG
    // ==============================

    const rtcConfig = {

        iceServers: [

            {
                urls:
                    "stun:stun.l.google.com:19302",
            },

        ],

    };


    // ==============================
    // CREATE PEER CONNECTION
    // ==============================

    const createPeerConnection = (
        userId
    ) => {

        const pc =
            new RTCPeerConnection(
                rtcConfig
            );


        // Remote stream

        remoteStream.current =
            new MediaStream();


        // Receive remote tracks

        pc.ontrack = (event) => {

            event.streams[0]
                .getTracks()
                .forEach((track) => {

                    remoteStream.current.addTrack(
                        track
                    );

                });


            if (remoteVideo.current) {

                remoteVideo.current.srcObject =
                    remoteStream.current;

            }

        };


        // ICE candidate

        pc.onicecandidate = (event) => {

            if (
                event.candidate &&
                socket
            ) {

                socket.emit(
                    "ice-candidate",
                    {
                        to: userId,
                        candidate:
                            event.candidate,
                    }
                );

            }

        };


        // Connection state

        pc.onconnectionstatechange = () => {

            console.log(
                "WebRTC state:",
                pc.connectionState
            );


            if (
                pc.connectionState ===
                "failed"
            ) {

                console.log(
                    "WebRTC connection failed"
                );

            }

        };


        peerConnection.current =
            pc;


        return pc;

    };


    // ==============================
    // GET USER MEDIA
    // ==============================

    const getMedia = async (
        type
    ) => {

        try {

            const stream =
                await navigator.mediaDevices
                    .getUserMedia({

                        audio: true,

                        video:
                            type ===
                            "video",

                    });


            localStream.current =
                stream;


            // Local video

            if (
                type === "video" &&
                localVideo.current
            ) {

                localVideo.current.srcObject =
                    stream;

            }


            return stream;

        } catch (error) {

            console.log(
                "Camera/Microphone error:",
                error
            );

            alert(
                "Please allow camera and microphone permission."
            );

            throw error;

        }

    };


    // ==============================
    // START AUDIO CALL
    // ==============================

    const startCall = async (
        receiverId,
        callerName
    ) => {

        if (!socket) return;


        try {

            setCallType("audio");

            setIsCalling(true);

            remoteUserId.current =
                receiverId;


            const stream =
                await getMedia("audio");


            const pc =
                createPeerConnection(
                    receiverId
                );


            // Add audio tracks

            stream
                .getTracks()
                .forEach((track) => {

                    pc.addTrack(
                        track,
                        stream
                    );

                });


            // Create offer

            const offer =
                await pc.createOffer();


            await pc.setLocalDescription(
                offer
            );


            // Tell receiver

            socket.emit(
                "call-user",
                {
                    to: receiverId,

                    from:
                        currentUser.id,

                    callerName,

                    callType:
                        "audio",
                }
            );


            // Send offer

            socket.emit(
                "offer",
                {
                    to: receiverId,

                    offer,

                    callType:
                        "audio",
                }
            );

        } catch (error) {

            console.log(
                "Audio call error:",
                error
            );

            cleanup();

        }

    };


    // ==============================
    // START VIDEO CALL
    // ==============================

    const startVideoCall = async (
        receiverId,
        callerName
    ) => {

        if (!socket) return;

        try {

            setCallType("video");

            setIsCalling(true);

            remoteUserId.current =
                receiverId;

            const stream =
                await getMedia("video");

            const pc =
                createPeerConnection(
                    receiverId
                );

            stream
                .getTracks()
                .forEach((track) => {

                    pc.addTrack(
                        track,
                        stream
                    );

                });

            const offer =
                await pc.createOffer();

            await pc.setLocalDescription(
                offer
            );


            // IMPORTANT
            socket.emit(
                "call-user",
                {
                    to: receiverId,

                    from:
                        currentUser.id,

                    callerName,

                    callType: "video",
                }
            );


            socket.emit(
                "offer",
                {
                    to: receiverId,

                    offer,

                    callType: "video",
                }
            );

        } catch (error) {

            console.log(
                "Video call error:",
                error
            );

            cleanup();

        }

    };


    // ==============================
    // ACCEPT CALL
    // ==============================

    const acceptCall = async () => {

        if (!socket || !incomingCall) {
            return;
        }

        try {

            // ==========================================
            // CALL TYPE
            // ==========================================

            const type =
                incomingCall.callType === "video"
                    ? "video"
                    : "audio";

            console.log(
                "Accepting call type:",
                type
            );


            // ==========================================
            // SAVE CALL INFORMATION
            // ==========================================

            setCallType(type);

            remoteUserId.current =
                incomingCall.from;


            // ==========================================
            // GET CAMERA / MICROPHONE
            // ==========================================

            const stream =
                await getMedia(type);


            // ==========================================
            // CREATE PEER CONNECTION
            // ==========================================

            const pc =
                createPeerConnection(
                    incomingCall.from
                );


            // ==========================================
            // ADD LOCAL TRACKS
            // ==========================================

            stream
                .getTracks()
                .forEach((track) => {

                    pc.addTrack(
                        track,
                        stream
                    );

                });


            // ==========================================
            // WAIT FOR OFFER
            // ==========================================

            if (!pendingOffer.current) {

                console.log(
                    "Offer not received yet"
                );

                setIsCalling(false);
                setIsInCall(false);

                return;
            }


            // ==========================================
            // SET REMOTE OFFER
            // ==========================================

            await pc.setRemoteDescription(
                new RTCSessionDescription(
                    pendingOffer.current
                )
            );


            console.log(
                "Remote offer set successfully"
            );


            // ==========================================
            // ADD PENDING ICE CANDIDATES
            // ==========================================

            for (
                const candidate
                of pendingCandidates.current
            ) {

                try {

                    await pc.addIceCandidate(
                        candidate
                    );

                } catch (error) {

                    console.log(
                        "ICE candidate error:",
                        error
                    );

                }

            }


            pendingCandidates.current = [];


            // ==========================================
            // CREATE ANSWER
            // ==========================================

            const answer =
                await pc.createAnswer();


            await pc.setLocalDescription(
                answer
            );


            // ==========================================
            // SEND ANSWER
            // ==========================================

            socket.emit(
                "answer",
                {
                    to:
                        incomingCall.from,

                    answer,
                }
            );


            console.log(
                "Answer sent"
            );


            // ==========================================
            // CALL CONNECTED
            // ==========================================

            setIsCalling(false);

            setIsInCall(true);

            setIncomingCall(null);


        } catch (error) {

            console.log(
                "Accept call error:",
                error
            );

            cleanup();

        }

    };


    // ==============================
    // REJECT CALL
    // ==============================

    const rejectCall = () => {

        if (
            socket &&
            incomingCall
        ) {

            socket.emit(
                "call-ended",
                {
                    to:
                        incomingCall.from,
                }
            );

        }


        setIncomingCall(null);

        pendingOffer.current =
            null;

        pendingCandidates.current =
            [];

    };


    // ==============================
    // END CALL
    // ==============================

    const endCall = (
        userId
    ) => {

        if (
            socket &&
            userId
        ) {

            socket.emit(
                "call-ended",
                {
                    to: userId,
                }
            );

        }


        cleanup();

    };


    // ==============================
    // CLEANUP
    // ==============================

    const cleanup = () => {

        // Close peer

        if (peerConnection.current) {

            peerConnection.current.close();

            peerConnection.current =
                null;

        }


        // Stop camera/microphone

        if (localStream.current) {

            localStream.current
                .getTracks()
                .forEach((track) => {

                    track.stop();

                });

            localStream.current =
                null;

        }


        // Clear video

        if (localVideo.current) {

            localVideo.current.srcObject =
                null;

        }


        if (remoteVideo.current) {

            remoteVideo.current.srcObject =
                null;

        }


        remoteStream.current =
            null;

        remoteUserId.current =
            null;

        pendingOffer.current =
            null;

        pendingCandidates.current =
            [];


        setIsCalling(false);

        setIsInCall(false);

        setCallType(null);

        setIncomingCall(null);

    };


    // ==============================
    // SOCKET EVENTS
    // ==============================

    useEffect(() => {

        if (!socket) return;


        // Incoming call

        const handleIncomingCall = ({
            from,
            callerName,
            callType,
        }) => {

            console.log(
                "Incoming call type:",
                callType
            );

            remoteUserId.current =
                from;

            setIncomingCall({
                from,
                callerName,
                callType:
                    callType === "video"
                        ? "video"
                        : "audio",
            });

        };


        // Receive offer

        const handleOffer = ({
            offer,
            callType,
        }) => {

            console.log(
                "Offer received"
            );


            pendingOffer.current =
                offer;


            if (callType) {

                setCallType(callType);

            }

        };


        // Receive answer

        const handleAnswer = async ({
            answer,
        }) => {

            console.log(
                "Answer received"
            );


            if (
                peerConnection.current
            ) {

                await peerConnection.current
                    .setRemoteDescription(
                        new RTCSessionDescription(
                            answer
                        )
                    );


                setIsCalling(false);

                setIsInCall(true);

            }

        };


        // Receive ICE candidate

        const handleIceCandidate = async ({
            candidate,
        }) => {

            if (
                !peerConnection.current ||
                !peerConnection.current
                    .remoteDescription
            ) {

                pendingCandidates.current
                    .push(candidate);

                return;

            }


            try {

                await peerConnection.current
                    .addIceCandidate(
                        candidate
                    );

            } catch (error) {

                console.log(
                    "ICE candidate error:",
                    error
                );

            }

        };


        // Call ended

        const handleCallEnded = () => {

            console.log(
                "Call ended"
            );

            cleanup();

        };


        socket.on(
            "incoming-call",
            handleIncomingCall
        );

        socket.on(
            "offer",
            handleOffer
        );

        socket.on(
            "answer",
            handleAnswer
        );

        socket.on(
            "ice-candidate",
            handleIceCandidate
        );

        socket.on(
            "call-ended",
            handleCallEnded
        );


        return () => {

            socket.off(
                "incoming-call",
                handleIncomingCall
            );

            socket.off(
                "offer",
                handleOffer
            );

            socket.off(
                "answer",
                handleAnswer
            );

            socket.off(
                "ice-candidate",
                handleIceCandidate
            );

            socket.off(
                "call-ended",
                handleCallEnded
            );

        };

    }, [socket]);


    return {

        startCall,

        startVideoCall,

        acceptCall,

        rejectCall,

        endCall,

        incomingCall,

        isCalling,

        isInCall,

        callType,

        localVideo,

        remoteVideo,

    };

};


export default useWebRTC;

