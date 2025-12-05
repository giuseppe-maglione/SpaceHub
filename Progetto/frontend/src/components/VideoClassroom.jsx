import React, { useEffect, useRef, useState } from "react";
import Janus from "../utils/janus";
import adapter from "webrtc-adapter";

const SERVER_URL = "wss://localhost:8989";

const VideoClassroom = ({ role = "student", roomId }) => {
    const room = roomId ? parseInt(roomId) : 200;

    const videoRef = useRef(null);
    const janusRef = useRef(null);
    const pluginRef = useRef(null);

    const localTracksRef = useRef([]);

    const [status, setStatus] = useState("Inizializzazione...");
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        Janus.init({
            debug: "all",
            callback: () => startJanus()
        });

        return () => {
            stopSharing();
            if (janusRef.current) janusRef.current.destroy();
        };
    }, []);

    // -------------------------------------------------------------
    //  AVVIO JANUS
    // -------------------------------------------------------------
    const startJanus = () => {
        const janus = new Janus({
            server: SERVER_URL,
            success: () => {
                janusRef.current = janus;
                attachPlugin();
            },
            error: (err) => console.error("Janus error", err),
        });
    };

    // -------------------------------------------------------------
    //  GESTIONE ROOM (EXISTS + CREATE)
    // -------------------------------------------------------------
    const ensureRoomExists = (plugin, room, callback) => {
        const check = {
            request: "exists",
            room: room
        };

        plugin.send({
            message: check,
            success: (result) => {
                if (result.exists) {
                    console.log("ROOM ESISTE:", room);
                    callback();
                } else {
                    console.log("ROOM NON ESISTE, CREAZIONE:", room);

                    const create = {
                        request: "create",
                        room: room,
                        permanent: false,
                        description: `Lezione ${room}`,
                        publishers: 1,
                        is_private: false
                    };

                    plugin.send({
                        message: create,
                        success: () => {
                            console.log("ROOM CREATA:", room);
                            callback();
                        }
                    });
                }
            }
        });
    };

    // -------------------------------------------------------------
    //  ATTACCO PLUGIN
    // -------------------------------------------------------------
    const attachPlugin = () => {
        janusRef.current.attach({
            plugin: "janus.plugin.videoroom",
            opaqueId: "videoroom-" + Janus.randomString(12),

            success: (plugin) => {
                pluginRef.current = plugin;

                // ➜ Prima verifico/creo la ROOM
                ensureRoomExists(plugin, room, () => {
                    console.log("ROOM READY — procedo con join");

                    if (role === "teacher") joinAsPublisher(plugin);
                    else joinAsSubscriber(plugin);
                });
            },

            error: (err) => console.error("Plugin attach error", err),

            onmessage: (msg, jsep) => {
                if (jsep) plugin.handleRemoteJsep({ jsep });

                if (msg.videoroom === "joined") {
                    setStatus(role === "teacher" ? "Docente connesso" : "Studente connesso");
                }

                if (msg.publishers && role === "student") {
                    const publisher = msg.publishers[0];
                    subscribeToPublisher(plugin, publisher.id);
                }
            },

            onremotestream: (stream) => {
                if (role === "student" && videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            }
        });
    };

    // -------------------------------------------------------------
    //  JOIN TEACHER
    // -------------------------------------------------------------
    const joinAsPublisher = (plugin) => {
        plugin.send({
            message: {
                request: "join",
                ptype: "publisher",
                room,
                display: "Docente"
            }
        });
    };

    // -------------------------------------------------------------
    //  JOIN STUDENTE
    // -------------------------------------------------------------
    const joinAsSubscriber = (plugin) => {
        plugin.send({
            message: {
                request: "join",
                ptype: "subscriber",
                room,
                display: "Studente"
            }
        });
    };

    // -------------------------------------------------------------
    //  SUBSCRIBE
    // -------------------------------------------------------------
    const subscribeToPublisher = (plugin, feedId) => {
        plugin.send({
            message: {
                request: "join",
                ptype: "subscriber",
                room,
                feed: feedId
            }
        });
    };

    // -------------------------------------------------------------
    //  SCREEN + MICROPHONE CAPTURE
    // -------------------------------------------------------------
    const handleStartSharing = async () => {
        try {
            const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const mic = await navigator.mediaDevices.getUserMedia({ audio: true });

            const combined = new MediaStream();
            screen.getTracks().forEach(t => combined.addTrack(t));
            mic.getTracks().forEach(t => combined.addTrack(t));

            localTracksRef.current = [...screen.getTracks(), ...mic.getTracks()];

            if (videoRef.current) {
                videoRef.current.srcObject = combined;
                videoRef.current.muted = true;
                videoRef.current.play();
            }

            publishToJanus(combined);
        } catch (err) {
            console.error("Capture error:", err);
        }
    };

    // -------------------------------------------------------------
    //  PUBBLICAZIONE STREAM
    // -------------------------------------------------------------
    const publishToJanus = (stream) => {
        pluginRef.current.createOffer({
            stream,
            media: {
                videoSend: true,
                audioSend: true,
                videoRecv: false,
                audioRecv: false
            },
            success: (jsep) => {
                pluginRef.current.send({
                    message: { request: "configure", audio: true, video: true },
                    jsep
                });

                setIsSharing(true);
            },
            error: (err) => console.error("createOffer error:", err)
        });
    };

    // -------------------------------------------------------------
    //  STOP SHARING
    // -------------------------------------------------------------
    const stopSharing = () => {
        localTracksRef.current.forEach(t => t.stop());
        localTracksRef.current = [];
        setIsSharing(false);
    };

    // -------------------------------------------------------------
    //  UI
    // -------------------------------------------------------------
    return (
        <div style={{ padding: 10, color: "#fff", background: "#000" }}>
            <h3>{role === "teacher" ? "Docente" : "Studente"} – Aula {room}</h3>
            <small>{status}</small>

            <video
                ref={videoRef}
                autoPlay
                playsInline
                controls
                style={{ width: "100%", background: "#222" }}
            />

            {role === "teacher" && !isSharing && (
                <button onClick={handleStartSharing} style={{ marginTop: 10 }}>
                    Avvia Condivisione
                </button>
            )}

            {role === "teacher" && isSharing && (
                <button onClick={stopSharing} style={{ marginTop: 10 }}>
                    Interrompi
                </button>
            )}
        </div>
    );
};

export default VideoClassroom;
