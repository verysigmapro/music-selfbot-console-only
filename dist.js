import {
    createRequire as rt
} from "node:module";
var it = (e, t) => () => (t || e((t = {
    exports: {}
}).exports, t), t.exports);
var a = rt(import.meta.url);
var Xt = it(function(ts, tt) {
    var {
        create: ot,
        defineProperty: S,
        getOwnPropertyDescriptor: nt,
        getOwnPropertyNames: at,
        getPrototypeOf: ct
    } = Object, dt = Object.prototype.hasOwnProperty, o = (e, t) => S(e, "name", {
        value: t,
        configurable: !0
    }), ut = (e, t) => {
        for (var s in t) S(e, s, {
            get: t[s],
            enumerable: !0
        })
    }, oe = (e, t, s, i) => {
        if (t && typeof t === "object" || typeof t === "function") {
            for (let r of at(t))
                if (!dt.call(e, r) && r !== s) S(e, r, {
                    get: () => t[r],
                    enumerable: !(i = nt(t, r)) || i.enumerable
                })
        }
        return e
    }, p = (e, t, s) => (s = e != null ? ot(ct(e)) : {}, oe(t || !e || !e.__esModule ? S(s, "default", {
        value: e,
        enumerable: !0
    }) : s, e)), ht = (e) => oe(S({}, "__esModule", {
        value: !0
    }), e), ne = {};
    ut(ne, {
        AudioPlayer: () => Pe,
        AudioPlayerError: () => me,
        AudioPlayerStatus: () => _e,
        AudioReceiveStream: () => Ve,
        AudioResource: () => U,
        DAVESession: () => Ee,
        EndBehaviorType: () => Ie,
        Networking: () => Re,
        NetworkingStatusCode: () => Oe,
        NoSubscriberBehavior: () => be,
        Node: () => je,
        PlayerSubscription: () => ve,
        RTP_OPUS_PAYLOAD_TYPE: () => j,
        SSRCMap: () => xe,
        SpeakingMap: () => Me,
        StreamType: () => L,
        TransformerType: () => $e,
        VoiceConnection: () => Be,
        VoiceConnectionDisconnectReason: () => Ue,
        VoiceConnectionStatus: () => Fe,
        VoiceReceiver: () => Ne,
        VoiceUDPSocket: () => Ce,
        VoiceWebSocket: () => Ae,
        createAudioPlayer: () => ke,
        createAudioResource: () => Ke,
        createDefaultAudioReceiveStreamOptions: () => H,
        demuxProbe: () => et,
        entersState: () => Qe,
        generateDependencyReport: () => Xe,
        getGroups: () => ce,
        getVoiceConnection: () => O,
        getVoiceConnections: () => D,
        joinVoiceChannel: () => We,
        validateDiscordOpusHead: () => K,
        version: () => Jt
    });
    tt.exports = ht(ne);
    var lt = a("events"),
        pt = a("discord-api-types/v10");

    function _(e) {
        return {
            op: pt.GatewayOpcodes.VoiceStateUpdate,
            d: {
                guild_id: e.guildId,
                channel_id: e.channelId,
                self_deaf: e.selfDeaf,
                self_mute: e.selfMute
            }
        }
    }
    o(_, "createJoinVoiceChannelPayload");
    var E = new Map;
    E.set("default", new Map);

    function ae(e) {
        let t = E.get(e);
        if (t) return t;
        let s = new Map;
        return E.set(e, s), s
    }
    o(ae, "getOrCreateGroup");

    function ce() {
        return E
    }
    o(ce, "getGroups");

    function D(e = "default") {
        return E.get(e)
    }
    o(D, "getVoiceConnections");

    function O(e, t = "default") {
        return D(t)?.get(e)
    }
    o(O, "getVoiceConnection");

    function de(e) {
        return D(e.joinConfig.group)?.delete(e.joinConfig.guildId)
    }
    o(de, "untrackVoiceConnection");

    function ue(e) {
        return ae(e.joinConfig.group).set(e.joinConfig.guildId, e)
    }
    o(ue, "trackVoiceConnection");
    var he = 20,
        V, P = -1n,
        m = [];
    var HeNs = 20000000n, BwNs = 100000n, HrC = process.hrtime.bigint;

    function q() {
        if (P === -1n) return;
        P += HeNs;
        let e = m.filter((t) => t.checkPlayable());
        for (let t of e) t._stepDispatch();
        le(e)
    }
    o(q, "audioCycleStep");

    function le(e) {
        for (let t of e) t._stepPrepare();
        if (P === -1n) return;
        var d = P - BwNs - HrC();
        V = setTimeout(() => { while (HrC() < P) {} q() }, d > 0n ? Number(d) / 1000000 : 0)
    }
    o(le, "prepareNextAudioFrame");

    function pe(e) {
        return m.includes(e)
    }
    o(pe, "hasAudioPlayer");

    function fe(e) {
        if (pe(e)) return e;
        if (m.push(e), m.length === 1) {
            var t = HrC(), r = BigInt(he) * 1000000n;
            P = t - t % r, setImmediate(() => q())
        }
        return e
    }
    o(fe, "addAudioPlayer");

    function ge(e) {
        let t = m.indexOf(e);
        if (t === -1) return;
        if (m.splice(t, 1), m.length === 0) {
            if (P = -1n, V !== void 0) clearTimeout(V)
        }
    }
    o(ge, "deleteAudioPlayer");
    var b = a("buffer"),
        ye = p(a("crypto")),
        ft = a("events"),
        d = a("discord-api-types/voice/v8"),
        J = a("buffer"),
        X = {
            "sodium-native": o((e) => ({
                crypto_aead_xchacha20poly1305_ietf_decrypt: o((t, s, i, r) => {
                    let n = J.Buffer.alloc(t.length - e.crypto_aead_xchacha20poly1305_ietf_ABYTES);
                    return e.crypto_aead_xchacha20poly1305_ietf_decrypt(n, null, t, s, i, r), n
                }, "crypto_aead_xchacha20poly1305_ietf_decrypt"),
                crypto_aead_xchacha20poly1305_ietf_encrypt: o((t, s, i, r) => {
                    let n = J.Buffer.alloc(t.length + e.crypto_aead_xchacha20poly1305_ietf_ABYTES);
                    return e.crypto_aead_xchacha20poly1305_ietf_encrypt(n, t, s, null, i, r), n
                }, "crypto_aead_xchacha20poly1305_ietf_encrypt")
            }), "sodium-native"),
            sodium: o((e) => ({
                crypto_aead_xchacha20poly1305_ietf_decrypt: o((t, s, i, r) => e.api.crypto_aead_xchacha20poly1305_ietf_decrypt(t, s, null, i, r), "crypto_aead_xchacha20poly1305_ietf_decrypt"),
                crypto_aead_xchacha20poly1305_ietf_encrypt: o((t, s, i, r) => e.api.crypto_aead_xchacha20poly1305_ietf_encrypt(t, s, null, i, r), "crypto_aead_xchacha20poly1305_ietf_encrypt")
            }), "sodium"),
            "libsodium-wrappers": o((e) => ({
                crypto_aead_xchacha20poly1305_ietf_decrypt: o((t, s, i, r) => e.crypto_aead_xchacha20poly1305_ietf_decrypt(null, t, s, i, r), "crypto_aead_xchacha20poly1305_ietf_decrypt"),
                crypto_aead_xchacha20poly1305_ietf_encrypt: o((t, s, i, r) => e.crypto_aead_xchacha20poly1305_ietf_encrypt(t, s, null, i, r), "crypto_aead_xchacha20poly1305_ietf_encrypt")
            }), "libsodium-wrappers"),
            "@stablelib/xchacha20poly1305": o((e) => ({
                crypto_aead_xchacha20poly1305_ietf_decrypt(t, s, i, r) {
                    return new e.XChaCha20Poly1305(r).open(i, t, s)
                },
                crypto_aead_xchacha20poly1305_ietf_encrypt(t, s, i, r) {
                    return new e.XChaCha20Poly1305(r).seal(i, t, s)
                }
            }), "@stablelib/xchacha20poly1305"),
            "@noble/ciphers/chacha.js": o((e) => ({
                crypto_aead_xchacha20poly1305_ietf_decrypt(t, s, i, r) {
                    return e.xchacha20poly1305(r, i, s).decrypt(t)
                },
                crypto_aead_xchacha20poly1305_ietf_encrypt(t, s, i, r) {
                    return e.xchacha20poly1305(r, i, s).encrypt(t)
                }
            }), "@noble/ciphers/chacha.js")
        },
        Z = o(() => {
            throw Error(`Cannot play audio as no valid encryption package is installed.
- Install one of:
  - sodium
  - libsodium-wrappers
  - @stablelib/xchacha20poly1305
  - @noble/ciphers.
- Use the generateDependencyReport() function for more information.
`)
        }, "fallbackError"),
        W = {
            crypto_aead_xchacha20poly1305_ietf_encrypt: Z,
            crypto_aead_xchacha20poly1305_ietf_decrypt: Z
        },
        es = new Promise(async (e) => {
            for (let t of Object.keys(X)) try {
                let s = await import(t);
                if (t === "libsodium-wrappers" && s.ready) await s.ready;
                Object.assign(W, X[t](s));
                break
            } catch {}
            e()
        }),
        j = 120,
        v = o(() => {}, "noop"),
        gt = a("buffer"),
        yt = a("events"),
        x = p(a("@snazzah/davey")),
        mt = a("buffer"),
        vt = a("events"),
        me = class extends Error {
            static {
                o(this, "AudioPlayerError")
            }
            resource;
            constructor(e, t) {
                super(e.message);
                this.resource = t, this.name = e.name, this.stack = e.stack
            }
        },
        ve = class {
            static {
                o(this, "PlayerSubscription")
            }
            connection;
            player;
            constructor(e, t) {
                this.connection = e, this.player = t
            }
            unsubscribe() {
                this.connection.onSubscriptionRemoved(this), this.player.unsubscribe(this)
            }
        },
        k = mt.Buffer.from([248, 255, 254]),
        be = ((e) => (e.Pause = "pause", e.Play = "play", e.Stop = "stop", e))(be || {}),
        _e = ((e) => (e.AutoPaused = "autopaused", e.Buffering = "buffering", e.Idle = "idle", e.Paused = "paused", e.Playing = "playing", e))(_e || {});

    function M(e) {
        return JSON.stringify({
            ...e,
            resource: Reflect.has(e, "resource"),
            stepTimeout: Reflect.has(e, "stepTimeout")
        })
    }
    o(M, "stringifyState");
    var Pe = class extends vt.EventEmitter {
        static {
            o(this, "AudioPlayer")
        }
        _state;
        subscribers = [];
        behaviors;
        debug;
        constructor(e = {}) {
            super();
            this._state = {
                status: "idle"
            }, this.behaviors = {
                noSubscriber: "pause",
                maxMissedFrames: 5,
                ...e.behaviors
            }, this.debug = e.debug === !1 ? null : (t) => this.emit("debug", t)
        }
        get playable() {
            return this.subscribers.filter(({
                connection: e
            }) => e.state.status === "ready").map(({
                connection: e
            }) => e)
        }
        subscribe(e) {
            let t = this.subscribers.find((s) => s.connection === e);
            if (!t) {
                let s = new ve(e, this);
                return this.subscribers.push(s), setImmediate(() => this.emit("subscribe", s)), s
            }
            return t
        }
        unsubscribe(e) {
            let t = this.subscribers.indexOf(e),
                s = t !== -1;
            if (s) this.subscribers.splice(t, 1), e.connection.setSpeaking(!1), this.emit("unsubscribe", e);
            return s
        }
        get state() {
            return this._state
        }
        set state(e) {
            let t = this._state,
                s = Reflect.get(e, "resource");
            if (t.status !== "idle" && t.resource !== s) t.resource.playStream.on("error", v), t.resource.playStream.off("error", t.onStreamError), t.resource.audioPlayer = void 0, t.resource.playStream.destroy(), t.resource.playStream.read();
            if (t.status === "buffering" && (e.status !== "buffering" || e.resource !== t.resource)) t.resource.playStream.off("end", t.onFailureCallback), t.resource.playStream.off("close", t.onFailureCallback), t.resource.playStream.off("finish", t.onFailureCallback), t.resource.playStream.off("readable", t.onReadableCallback);
            if (e.status === "idle") this._signalStopSpeaking(), ge(this);
            if (s) fe(this);
            let i = t.status !== "idle" && e.status === "playing" && t.resource !== e.resource;
            if (this._state = e, this.emit("stateChange", t, this._state), t.status !== e.status || i) this.emit(e.status, t, this._state);
            this.debug?.(`state change:
from ${M(t)}
to ${M(e)}`)
        }
        play(e) {
            if (e.ended) throw Error("Cannot play a resource that has already ended.");
            if (e.audioPlayer) {
                if (e.audioPlayer === this) return;
                throw Error("Resource is already being played by another audio player.")
            }
            e.audioPlayer = this;
            let t = o((s) => {
                if (this.state.status !== "idle") this.emit("error", new me(s, this.state.resource));
                if (this.state.status !== "idle" && this.state.resource === e) this.state = {
                    status: "idle"
                }
            }, "onStreamError");
            if (e.playStream.once("error", t), e.started) this.state = {
                status: "playing",
                missedFrames: 0,
                playbackDuration: 0,
                resource: e,
                onStreamError: t
            };
            else {
                let s = o(() => {
                        if (this.state.status === "buffering" && this.state.resource === e) this.state = {
                            status: "playing",
                            missedFrames: 0,
                            playbackDuration: 0,
                            resource: e,
                            onStreamError: t
                        }
                    }, "onReadableCallback"),
                    i = o(() => {
                        if (this.state.status === "buffering" && this.state.resource === e) this.state = {
                            status: "idle"
                        }
                    }, "onFailureCallback");
                e.playStream.once("readable", s), e.playStream.once("end", i), e.playStream.once("close", i), e.playStream.once("finish", i), this.state = {
                    status: "buffering",
                    resource: e,
                    onReadableCallback: s,
                    onFailureCallback: i,
                    onStreamError: t
                }
            }
        }
        pause(e = !0) {
            if (this.state.status !== "playing") return !1;
            return this.state = {
                ...this.state,
                status: "paused",
                silencePacketsRemaining: e ? 5 : 0
            }, !0
        }
        unpause() {
            if (this.state.status !== "paused") return !1;
            return this.state = {
                ...this.state,
                status: "playing",
                missedFrames: 0
            }, !0
        }
        stop(e = !1) {
            if (this.state.status === "idle") return !1;
            if (e || this.state.resource.silencePaddingFrames === 0) this.state = {
                status: "idle"
            };
            else if (this.state.resource.silenceRemaining === -1) this.state.resource.silenceRemaining = this.state.resource.silencePaddingFrames;
            return !0
        }
        checkPlayable() {
            let e = this._state;
            if (e.status === "idle" || e.status === "buffering") return !1;
            if (!e.resource.readable) return this.state = {
                status: "idle"
            }, !1;
            return !0
        }
        _stepDispatch() {
            let e = this._state;
            if (e.status === "idle" || e.status === "buffering") return;
            for (let t of this.playable) t.dispatchAudio()
        }
        _stepPrepare() {
            let e = this._state;
            if (e.status === "idle" || e.status === "buffering") return;
            let t = this.playable;
            if (e.status === "autopaused" && t.length > 0) this.state = {
                ...e,
                status: "playing",
                missedFrames: 0
            };
            if (e.status === "paused" || e.status === "autopaused") {
                if (e.silencePacketsRemaining > 0) {
                    if (e.silencePacketsRemaining--, this._preparePacket(k, t, e), e.silencePacketsRemaining === 0) this._signalStopSpeaking()
                }
                return
            }
            if (t.length === 0) {
                if (this.behaviors.noSubscriber === "pause") {
                    this.state = {
                        ...e,
                        status: "autopaused",
                        silencePacketsRemaining: 5
                    };
                    return
                } else if (this.behaviors.noSubscriber === "stop") this.stop(!0)
            }
            let s = e.resource.read();
            if (e.status === "playing") {
                if (s) this._preparePacket(s, t, e), e.missedFrames = 0;
                else if (this._preparePacket(k, t, e), e.missedFrames++, e.missedFrames >= this.behaviors.maxMissedFrames) this.stop()
            }
        }
        _signalStopSpeaking() {
            for (let {
                    connection: e
                }
                of this.subscribers) e.setSpeaking(!1)
        }
        _preparePacket(e, t, s) {
            s.playbackDuration += 20;
            for (let i of t) i.prepareAudioPacket(e)
        }
    };

    function ke(e) {
        return new Pe(e)
    }
    o(ke, "createAudioPlayer");
    var Q = 10,
        bt = 24,
        _t = 36;

    function we() {
        return x.default.DAVE_PROTOCOL_VERSION
    }
    o(we, "getMaxProtocolVersion");
    var Ee = class extends yt.EventEmitter {
            static {
                o(this, "DAVESession")
            }
            channelId;
            userId;
            protocolVersion;
            lastTransitionId;
            pendingTransitions = new Map;
            downgraded = !1;
            consecutiveFailures = 0;
            failureTolerance;
            reinitializing = !1;
            session;
            constructor(e, t, s, i) {
                super();
                this.protocolVersion = e, this.userId = t, this.channelId = s, this.failureTolerance = i.decryptionFailureTolerance ?? _t
            }
            get voicePrivacyCode() {
                if (this.protocolVersion === 0 || !this.session?.voicePrivacyCode) return null;
                return this.session.voicePrivacyCode
            }
            async getVerificationCode(e) {
                if (!this.session) throw Error("Session not available");
                return this.session.getVerificationCode(e)
            }
            reinit() {
                if (this.protocolVersion > 0) {
                    if (this.session) this.session.reinit(this.protocolVersion, this.userId, this.channelId), this.emit("debug", `Session reinitialized for protocol version ${this.protocolVersion}`);
                    else this.session = new x.default.DAVESession(this.protocolVersion, this.userId, this.channelId), this.emit("debug", `Session initialized for protocol version ${this.protocolVersion}`);
                    this.emit("keyPackage", this.session.getSerializedKeyPackage())
                } else if (this.session) this.session.reset(), this.session.setPassthroughMode(!0, Q), this.emit("debug", "Session reset")
            }
            setExternalSender(e) {
                if (!this.session) throw Error("No session available");
                this.session.setExternalSender(e), this.emit("debug", "Set MLS external sender")
            }
            prepareTransition(e) {
                if (this.emit("debug", `Preparing for transition (${e.transition_id}, v${e.protocol_version})`), this.pendingTransitions.set(e.transition_id, e.protocol_version), e.transition_id === 0) this.executeTransition(e.transition_id);
                else {
                    if (e.protocol_version === 0) this.session?.setPassthroughMode(!0, bt);
                    return !0
                }
                return !1
            }
            executeTransition(e) {
                if (this.emit("debug", `Executing transition (${e})`), !this.pendingTransitions.has(e)) return this.emit("debug", `Received execute transition, but we don't have a pending transition for ${e}`), !1;
                let t = this.protocolVersion;
                if (this.protocolVersion = this.pendingTransitions.get(e), t !== this.protocolVersion && this.protocolVersion === 0) this.downgraded = !0, this.emit("debug", "Session downgraded");
                else if (e > 0 && this.downgraded) this.downgraded = !1, this.session?.setPassthroughMode(!0, Q), this.emit("debug", "Session upgraded");
                return this.reinitializing = !1, this.lastTransitionId = e, this.emit("debug", `Transition executed (v${t} -> v${this.protocolVersion}, id: ${e})`), this.pendingTransitions.delete(e), !0
            }
            prepareEpoch(e) {
                if (this.emit("debug", `Preparing for epoch (${e.epoch})`), e.epoch === 1) this.protocolVersion = e.protocol_version, this.reinit()
            }
            recoverFromInvalidTransition(e) {
                if (this.reinitializing) return;
                this.emit("debug", `Invalidating transition ${e}`), this.reinitializing = !0, this.consecutiveFailures = 0, this.emit("invalidateTransition", e), this.reinit()
            }
            processProposals(e, t) {
                if (!this.session) throw Error("No session available");
                let s = e.readUInt8(0),
                    {
                        commit: i,
                        welcome: r
                    } = this.session.processProposals(s, e.subarray(1), Array.from(t));
                if (this.emit("debug", "MLS proposals processed"), !i) return;
                return r ? gt.Buffer.concat([i, r]) : i
            }
            processCommit(e) {
                if (!this.session) throw Error("No session available");
                let t = e.readUInt16BE(0);
                try {
                    if (this.session.processCommit(e.subarray(2)), t === 0) this.reinitializing = !1, this.lastTransitionId = t;
                    else this.pendingTransitions.set(t, this.protocolVersion);
                    return this.emit("debug", `MLS commit processed (transition id: ${t})`), {
                        transitionId: t,
                        success: !0
                    }
                } catch (s) {
                    return this.emit("debug", `MLS commit errored from transition ${t}: ${s}`), this.recoverFromInvalidTransition(t), {
                        transitionId: t,
                        success: !1
                    }
                }
            }
            processWelcome(e) {
                if (!this.session) throw Error("No session available");
                let t = e.readUInt16BE(0);
                try {
                    if (this.session.processWelcome(e.subarray(2)), t === 0) this.reinitializing = !1, this.lastTransitionId = t;
                    else this.pendingTransitions.set(t, this.protocolVersion);
                    return this.emit("debug", `MLS welcome processed (transition id: ${t})`), {
                        transitionId: t,
                        success: !0
                    }
                } catch (s) {
                    return this.emit("debug", `MLS welcome errored from transition ${t}: ${s}`), this.recoverFromInvalidTransition(t), {
                        transitionId: t,
                        success: !1
                    }
                }
            }
            encrypt(e) {
                if (this.protocolVersion === 0 || !this.session?.ready || e.equals(k)) return e;
                return this.session.encryptOpus(e)
            }
            decrypt(e, t) {
                let s = this.session?.ready && (this.protocolVersion !== 0 || this.session?.canPassthrough(t));
                if (e.equals(k) || !s || !this.session) return e;
                try {
                    let i = this.session.decrypt(t, x.default.MediaType.AUDIO, e);
                    return this.consecutiveFailures = 0, i
                } catch (i) {
                    if (!this.reinitializing && this.pendingTransitions.size === 0) {
                        if (this.consecutiveFailures++, this.emit("debug", `Failed to decrypt a packet (${this.consecutiveFailures} consecutive fails)`), this.consecutiveFailures > this.failureTolerance)
                            if (this.lastTransitionId) this.recoverFromInvalidTransition(this.lastTransitionId);
                            else throw i
                    } else if (this.reinitializing) this.emit("debug", "Failed to decrypt a packet (reinitializing session)");
                    else if (this.pendingTransitions.size > 0) this.emit("debug", `Failed to decrypt a packet (${this.pendingTransitions.size} pending transition[s])`)
                }
                return null
            }
            destroy() {
                try {
                    this.session?.reset()
                } catch {}
            }
        },
        N = a("buffer"),
        Pt = a("dgram"),
        kt = a("events"),
        wt = a("net");

    function Se(e) {
        let t = N.Buffer.from(e),
            s = t.subarray(8, t.indexOf(0, 8)).toString("utf8");
        if (!(0, wt.isIPv4)(s)) throw Error("Malformed IP address");
        let i = t.readUInt16BE(t.length - 2);
        return {
            ip: s,
            port: i
        }
    }
    o(Se, "parseLocalPacket");
    var Et = 5000,
        St = 4294967295,
        Ce = class extends kt.EventEmitter {
            static {
                o(this, "VoiceUDPSocket")
            }
            socket;
            remote;
            keepAliveCounter = 0;
            keepAliveBuffer;
            keepAliveInterval;
            ping;
            constructor(e) {
                super();
                this.socket = (0, Pt.createSocket)("udp4"), this.socket.on("error", (t) => this.emit("error", t)), this.socket.on("message", (t) => this.onMessage(t)), this.socket.on("close", () => this.emit("close")), this.remote = e, this.keepAliveBuffer = N.Buffer.alloc(8), this.keepAliveInterval = setInterval(() => this.keepAlive(), Et), setImmediate(() => this.keepAlive())
            }
            onMessage(e) {
                this.emit("message", e)
            }
            keepAlive() {
                if (this.keepAliveBuffer.writeUInt32LE(this.keepAliveCounter, 0), this.send(this.keepAliveBuffer), this.keepAliveCounter++, this.keepAliveCounter > St) this.keepAliveCounter = 0
            }
            send(e) {
                this.socket.send(e, this.remote.port, this.remote.ip)
            }
            destroy() {
                try {
                    this.socket.close()
                } catch {}
                clearInterval(this.keepAliveInterval)
            }
            async performIPDiscovery(e) {
                return new Promise((t, s) => {
                    let i = o((n) => {
                        try {
                            if (n.readUInt16BE(0) !== 2) return;
                            let c = Se(n);
                            this.socket.off("message", i), t(c)
                        } catch {}
                    }, "listener");
                    this.socket.on("message", i), this.socket.once("close", () => s(Error("Cannot perform IP discovery - socket closed")));
                    let r = N.Buffer.alloc(74);
                    r.writeUInt16BE(1, 0), r.writeUInt16BE(70, 2), r.writeUInt32BE(e, 4), this.send(r)
                })
            }
        },
        I = a("buffer"),
        Ct = a("events"),
        ee = a("discord-api-types/voice/v8"),
        At = p(a("ws")),
        Ae = class extends Ct.EventEmitter {
            static {
                o(this, "VoiceWebSocket")
            }
            heartbeatInterval;
            lastHeartbeatAck;
            lastHeartbeatSend;
            missedHeartbeats = 0;
            ping;
            sequence = -1;
            debug;
            ws;
            constructor(e, t) {
                super();
                this.ws = new At.default(e), this.ws.onmessage = (s) => this.onMessage(s), this.ws.onopen = (s) => this.emit("open", s), this.ws.onerror = (s) => this.emit("error", s instanceof Error ? s : s.error), this.ws.onclose = (s) => this.emit("close", s), this.lastHeartbeatAck = 0, this.lastHeartbeatSend = 0, this.debug = t ? (s) => this.emit("debug", s) : null
            }
            destroy() {
                try {
                    this.debug?.("destroyed"), this.setHeartbeatInterval(-1), this.ws.close(1000)
                } catch (e) {
                    let t = e;
                    this.emit("error", t)
                }
            }
            onMessage(e) {
                if (e.data instanceof I.Buffer || e.data instanceof ArrayBuffer) {
                    let s = e.data instanceof ArrayBuffer ? I.Buffer.from(e.data) : e.data,
                        i = s.readUInt16BE(0),
                        r = s.readUInt8(2),
                        n = s.subarray(3);
                    this.sequence = i, this.debug?.(`<< [bin] opcode ${r}, seq ${i}, ${n.byteLength} bytes`), this.emit("binary", {
                        op: r,
                        seq: i,
                        payload: n
                    });
                    return
                } else if (typeof e.data !== "string") return;
                this.debug?.(`<< ${e.data}`);
                let t;
                try {
                    t = JSON.parse(e.data)
                } catch (s) {
                    let i = s;
                    this.emit("error", i);
                    return
                }
                if (t.seq) this.sequence = t.seq;
                if (t.op === ee.VoiceOpcodes.HeartbeatAck) this.lastHeartbeatAck = Date.now(), this.missedHeartbeats = 0, this.ping = this.lastHeartbeatAck - this.lastHeartbeatSend;
                this.emit("packet", t)
            }
            sendPacket(e) {
                try {
                    let t = JSON.stringify(e);
                    this.debug?.(`>> ${t}`), this.ws.send(t)
                } catch (t) {
                    let s = t;
                    this.emit("error", s)
                }
            }
            sendBinaryMessage(e, t) {
                try {
                    let s = I.Buffer.concat([new Uint8Array([e]), t]);
                    this.debug?.(`>> [bin] opcode ${e}, ${t.byteLength} bytes`), this.ws.send(s)
                } catch (s) {
                    let i = s;
                    this.emit("error", i)
                }
            }
            sendHeartbeat() {
                this.lastHeartbeatSend = Date.now(), this.missedHeartbeats++;
                let e = this.lastHeartbeatSend;
                this.sendPacket({
                    op: ee.VoiceOpcodes.Heartbeat,
                    d: {
                        t: e,
                        seq_ack: this.sequence
                    }
                })
            }
            setHeartbeatInterval(e) {
                if (this.heartbeatInterval !== void 0) clearInterval(this.heartbeatInterval);
                if (e > 0) this.heartbeatInterval = setInterval(() => {
                    if (this.lastHeartbeatSend !== 0 && this.missedHeartbeats >= 3) this.ws.close(), this.setHeartbeatInterval(-1);
                    this.sendHeartbeat()
                }, e)
            }
        },
        Dt = 2,
        Ot = 480 * Dt,
        Tt = 4294967295,
        De = [d.VoiceEncryptionMode.AeadXChaCha20Poly1305RtpSize];
    if (ye.default.getCiphers().includes("aes-256-gcm")) De.unshift(d.VoiceEncryptionMode.AeadAes256GcmRtpSize);
    var Oe = ((e) => (e[e.OpeningWs = 0] = "OpeningWs", e[e.Identifying = 1] = "Identifying", e[e.UdpHandshaking = 2] = "UdpHandshaking", e[e.SelectingProtocol = 3] = "SelectingProtocol", e[e.Ready = 4] = "Ready", e[e.Resuming = 5] = "Resuming", e[e.Closed = 6] = "Closed", e))(Oe || {}),
        Rt = b.Buffer.alloc(24);

    function F(e) {
        return JSON.stringify({
            ...e,
            ws: Reflect.has(e, "ws"),
            udp: Reflect.has(e, "udp")
        })
    }
    o(F, "stringifyState");

    function Te(e) {
        let t = De.find((s) => e.includes(s));
        if (!t) throw Error(`No compatible encryption modes. Available include: ${e.join(", ")}`);
        return t
    }
    o(Te, "chooseEncryptionMode");

    function It(e) {
        return Math.floor(Math.random() * 2 ** e)
    }
    o(It, "randomNBit");
    var Re = class extends ft.EventEmitter {
            static {
                o(this, "Networking")
            }
            _state;
            debug;
            options;
            constructor(e, t) {
                super();
                this.onWsOpen = this.onWsOpen.bind(this), this.onChildError = this.onChildError.bind(this), this.onWsPacket = this.onWsPacket.bind(this), this.onWsBinary = this.onWsBinary.bind(this), this.onWsClose = this.onWsClose.bind(this), this.onWsDebug = this.onWsDebug.bind(this), this.onUdpDebug = this.onUdpDebug.bind(this), this.onUdpClose = this.onUdpClose.bind(this), this.onDaveDebug = this.onDaveDebug.bind(this), this.onDaveKeyPackage = this.onDaveKeyPackage.bind(this), this.onDaveInvalidateTransition = this.onDaveInvalidateTransition.bind(this), this.debug = t?.debug ? (s) => this.emit("debug", s) : null, this._state = {
                    code: 0,
                    ws: this.createWebSocket(e.endpoint),
                    connectionOptions: e
                }, this.options = t
            }
            destroy() {
                this.state = {
                    code: 6
                }
            }
            get state() {
                return this._state
            }
            set state(e) {
                let t = Reflect.get(this._state, "ws"),
                    s = Reflect.get(e, "ws");
                if (t && t !== s) t.off("debug", this.onWsDebug), t.on("error", v), t.off("error", this.onChildError), t.off("open", this.onWsOpen), t.off("packet", this.onWsPacket), t.off("binary", this.onWsBinary), t.off("close", this.onWsClose), t.destroy();
                let i = Reflect.get(this._state, "udp"),
                    r = Reflect.get(e, "udp");
                if (i && i !== r) i.on("error", v), i.off("error", this.onChildError), i.off("close", this.onUdpClose), i.off("debug", this.onUdpDebug), i.destroy();
                let n = Reflect.get(this._state, "dave"),
                    c = Reflect.get(e, "dave");
                if (n && n !== c) n.off("error", this.onChildError), n.off("debug", this.onDaveDebug), n.off("keyPackage", this.onDaveKeyPackage), n.off("invalidateTransition", this.onDaveInvalidateTransition), n.destroy();
                let u = this._state;
                this._state = e, this.emit("stateChange", u, e), this.debug?.(`state change:
from ${F(u)}
to ${F(e)}`)
            }
            createWebSocket(e, t) {
                let s = new Ae(`wss://${e}?v=8`, Boolean(this.debug));
                if (t !== void 0) s.sequence = t;
                return s.on("error", this.onChildError), s.once("open", this.onWsOpen), s.on("packet", this.onWsPacket), s.on("binary", this.onWsBinary), s.once("close", this.onWsClose), s.on("debug", this.onWsDebug), s
            }
            createDaveSession(e) {
                if (this.options.daveEncryption === !1 || this.state.code !== 3 && this.state.code !== 4 && this.state.code !== 5) return;
                let t = new Ee(e, this.state.connectionOptions.userId, this.state.connectionOptions.channelId, {
                    decryptionFailureTolerance: this.options.decryptionFailureTolerance
                });
                return t.on("error", this.onChildError), t.on("debug", this.onDaveDebug), t.on("keyPackage", this.onDaveKeyPackage), t.on("invalidateTransition", this.onDaveInvalidateTransition), t.reinit(), t
            }
            onChildError(e) {
                this.emit("error", e)
            }
            onWsOpen() {
                if (this.state.code === 0) this.state.ws.sendPacket({
                    op: d.VoiceOpcodes.Identify,
                    d: {
                        server_id: this.state.connectionOptions.serverId,
                        user_id: this.state.connectionOptions.userId,
                        session_id: this.state.connectionOptions.sessionId,
                        token: this.state.connectionOptions.token,
                        max_dave_protocol_version: this.options.daveEncryption === !1 ? 0 : we()
                    }
                }), this.state = {
                    ...this.state,
                    code: 1
                };
                else if (this.state.code === 5) this.state.ws.sendPacket({
                    op: d.VoiceOpcodes.Resume,
                    d: {
                        server_id: this.state.connectionOptions.serverId,
                        session_id: this.state.connectionOptions.sessionId,
                        token: this.state.connectionOptions.token,
                        seq_ack: this.state.ws.sequence
                    }
                })
            }
            onWsClose({
                code: e
            }) {
                if ((e === 4015 || e < 4000) && this.state.code === 4) {
                    let s = this.state.ws.sequence;
                    this.state = {
                        ...this.state,
                        code: 5,
                        ws: this.createWebSocket(this.state.connectionOptions.endpoint, s)
                    }
                } else if (this.state.code !== 6) this.destroy(), this.emit("close", e)
            }
            onUdpClose() {
                if (this.state.code === 4) {
                    let e = this.state.ws.sequence;
                    this.state = {
                        ...this.state,
                        code: 5,
                        ws: this.createWebSocket(this.state.connectionOptions.endpoint, e)
                    }
                }
            }
            onWsPacket(e) {
                if (e.op === d.VoiceOpcodes.Hello && this.state.code !== 6) this.state.ws.setHeartbeatInterval(e.d.heartbeat_interval);
                else if (e.op === d.VoiceOpcodes.Ready && this.state.code === 1) {
                    let {
                        ip: t,
                        port: s,
                        ssrc: i,
                        modes: r
                    } = e.d, n = new Ce({
                        ip: t,
                        port: s
                    });
                    n.on("error", this.onChildError), n.on("debug", this.onUdpDebug), n.once("close", this.onUdpClose), n.performIPDiscovery(i).then((c) => {
                        if (this.state.code !== 2) return;
                        this.state.ws.sendPacket({
                            op: d.VoiceOpcodes.SelectProtocol,
                            d: {
                                protocol: "udp",
                                data: {
                                    address: c.ip,
                                    port: c.port,
                                    mode: Te(r)
                                }
                            }
                        }), this.state = {
                            ...this.state,
                            code: 3
                        }
                    }).catch((c) => this.emit("error", c)), this.state = {
                        ...this.state,
                        code: 2,
                        udp: n,
                        connectionData: {
                            ssrc: i,
                            connectedClients: new Set
                        }
                    }
                } else if (e.op === d.VoiceOpcodes.SessionDescription && this.state.code === 3) {
                    let {
                        mode: t,
                        secret_key: s,
                        dave_protocol_version: i
                    } = e.d;
                    this.state = {
                        ...this.state,
                        code: 4,
                        dave: this.createDaveSession(i),
                        connectionData: {
                            ...this.state.connectionData,
                            encryptionMode: t,
                            secretKey: new Uint8Array(s),
                            sequence: 0,
                            timestamp: 0,
                            nonce: 0,
                            nonceBuffer: t === "aead_aes256_gcm_rtpsize" ? b.Buffer.alloc(12) : b.Buffer.alloc(24),
                            speaking: !1,
                            packetsPlayed: 0
                        }
                    }
                } else if (e.op === d.VoiceOpcodes.Resumed && this.state.code === 5) this.state = {
                    ...this.state,
                    code: 4
                }, this.state.connectionData.speaking = !1;
                else if ((e.op === d.VoiceOpcodes.ClientsConnect || e.op === d.VoiceOpcodes.ClientDisconnect) && (this.state.code === 4 || this.state.code === 2 || this.state.code === 3 || this.state.code === 5)) {
                    let {
                        connectionData: t
                    } = this.state;
                    if (e.op === d.VoiceOpcodes.ClientsConnect)
                        for (let s of e.d.user_ids) t.connectedClients.add(s);
                    else t.connectedClients.delete(e.d.user_id)
                } else if ((this.state.code === 4 || this.state.code === 5) && this.state.dave) {
                    if (e.op === d.VoiceOpcodes.DavePrepareTransition) {
                        if (this.state.dave.prepareTransition(e.d)) this.state.ws.sendPacket({
                            op: d.VoiceOpcodes.DaveTransitionReady,
                            d: {
                                transition_id: e.d.transition_id
                            }
                        });
                        if (e.d.transition_id === 0) this.emit("transitioned", 0)
                    } else if (e.op === d.VoiceOpcodes.DaveExecuteTransition) {
                        if (this.state.dave.executeTransition(e.d.transition_id)) this.emit("transitioned", e.d.transition_id)
                    } else if (e.op === d.VoiceOpcodes.DavePrepareEpoch) this.state.dave.prepareEpoch(e.d)
                }
            }
            onWsBinary(e) {
                if (this.state.code === 4 && this.state.dave) {
                    if (e.op === d.VoiceOpcodes.DaveMlsExternalSender) this.state.dave.setExternalSender(e.payload);
                    else if (e.op === d.VoiceOpcodes.DaveMlsProposals) {
                        let t = this.state.dave.processProposals(e.payload, this.state.connectionData.connectedClients);
                        if (t) this.state.ws.sendBinaryMessage(d.VoiceOpcodes.DaveMlsCommitWelcome, t)
                    } else if (e.op === d.VoiceOpcodes.DaveMlsAnnounceCommitTransition) {
                        let {
                            transitionId: t,
                            success: s
                        } = this.state.dave.processCommit(e.payload);
                        if (s)
                            if (t === 0) this.emit("transitioned", t);
                            else this.state.ws.sendPacket({
                                op: d.VoiceOpcodes.DaveTransitionReady,
                                d: {
                                    transition_id: t
                                }
                            })
                    } else if (e.op === d.VoiceOpcodes.DaveMlsWelcome) {
                        let {
                            transitionId: t,
                            success: s
                        } = this.state.dave.processWelcome(e.payload);
                        if (s)
                            if (t === 0) this.emit("transitioned", t);
                            else this.state.ws.sendPacket({
                                op: d.VoiceOpcodes.DaveTransitionReady,
                                d: {
                                    transition_id: t
                                }
                            })
                    }
                }
            }
            onDaveKeyPackage(e) {
                if (this.state.code === 3 || this.state.code === 4) this.state.ws.sendBinaryMessage(d.VoiceOpcodes.DaveMlsKeyPackage, e)
            }
            onDaveInvalidateTransition(e) {
                if (this.state.code === 3 || this.state.code === 4) this.state.ws.sendPacket({
                    op: d.VoiceOpcodes.DaveMlsInvalidCommitWelcome,
                    d: {
                        transition_id: e
                    }
                })
            }
            onWsDebug(e) {
                this.debug?.(`[WS] ${e}`)
            }
            onUdpDebug(e) {
                this.debug?.(`[UDP] ${e}`)
            }
            onDaveDebug(e) {
                this.debug?.(`[DAVE] ${e}`)
            }
            prepareAudioPacket(e) {
                let t = this.state;
                if (t.code !== 4) return;
                return t.preparedPacket = this.createAudioPacket(e, t.connectionData, t.dave), t.preparedPacket
            }
            dispatchAudio() {
                let e = this.state;
                if (e.code !== 4) return !1;
                if (e.preparedPacket !== void 0) return this.playAudioPacket(e.preparedPacket), e.preparedPacket = void 0, !0;
                return !1
            }
            playAudioPacket(e) {
                let t = this.state;
                if (t.code !== 4) return;
                let {
                    connectionData: s
                } = t;
                if (s.packetsPlayed++, s.sequence++, s.timestamp += Ot, s.sequence >= 65536) s.sequence = 0;
                if (s.timestamp >= 4294967296) s.timestamp = 0;
                this.setSpeaking(!0), t.udp.send(e)
            }
            setSpeaking(e) {
                let t = this.state;
                if (t.code !== 4) return;
                if (t.connectionData.speaking === e) return;
                t.connectionData.speaking = e, t.ws.sendPacket({
                    op: d.VoiceOpcodes.Speaking,
                    d: {
                        speaking: e ? 1 : 0,
                        delay: 0,
                        ssrc: t.connectionData.ssrc
                    }
                })
            }
            createAudioPacket(e, t, s) {
                if (!t.rtpHeader) t.rtpHeader = b.Buffer.alloc(12), t.rtpHeader[0] = 128, t.rtpHeader[1] = j;
                let i = t.rtpHeader,
                    {
                        sequence: r,
                        timestamp: n,
                        ssrc: c
                    } = t;
                return i.writeUIntBE(r, 2, 2), i.writeUIntBE(n, 4, 4), i.writeUIntBE(c, 8, 4), i.copy(Rt, 0, 0, 12), b.Buffer.concat([i, ...this.encryptOpusPacket(e, t, i, s)])
            }
            encryptOpusPacket(e, t, s, i) {
                let {
                    secretKey: r,
                    encryptionMode: n
                } = t, c = i?.encrypt(e) ?? e;
                if (t.nonce++, t.nonce > Tt) t.nonce = 0;
                t.nonceBuffer.writeUInt32BE(t.nonce, 0);
                let u = t.nonceBuffer.subarray(0, 4),
                    h;
                switch (n) {
                    case "aead_aes256_gcm_rtpsize": {
                        let l = ye.default.createCipheriv("aes-256-gcm", r, t.nonceBuffer);
                        return l.setAAD(s), h = b.Buffer.concat([l.update(c), l.final(), l.getAuthTag()]), [h, u]
                    }
                    case "aead_xchacha20_poly1305_rtpsize":
                        return h = W.crypto_aead_xchacha20poly1305_ietf_encrypt(c, s, t.nonceBuffer, r), [h, u];
                    default:
                        throw RangeError(`Unsupported encryption method: ${n}`)
                }
            }
        },
        A = a("buffer"),
        Vt = p(a("crypto")),
        te = a("discord-api-types/voice/v8"),
        xt = p(a("process")),
        Mt = a("stream"),
        Ie = ((e) => (e[e.Manual = 0] = "Manual", e[e.AfterSilence = 1] = "AfterSilence", e[e.AfterInactivity = 2] = "AfterInactivity", e))(Ie || {});

    function H() {
        return {
            end: {
                behavior: 0
            }
        }
    }
    o(H, "createDefaultAudioReceiveStreamOptions");
    var Ve = class extends Mt.Readable {
            static {
                o(this, "AudioReceiveStream")
            }
            end;
            endTimeout;
            constructor(e) {
                let {
                    end: t,
                    ...s
                } = e;
                super({
                    ...s,
                    objectMode: !0
                });
                this.end = t
            }
            push(e) {
                if (e && (this.end.behavior === 2 || this.end.behavior === 1 && (e.compare(k) !== 0 || this.endTimeout === void 0))) this.renewEndTimeout(this.end);
                if (e === null) xt.default.nextTick(() => this.destroy());
                return super.push(e)
            }
            renewEndTimeout(e) {
                if (this.endTimeout) clearTimeout(this.endTimeout);
                this.endTimeout = setTimeout(() => this.push(null), e.duration)
            }
            _read() {}
        },
        Nt = a("events"),
        xe = class extends Nt.EventEmitter {
            static {
                o(this, "SSRCMap")
            }
            map;
            constructor() {
                super();
                this.map = new Map
            }
            update(e) {
                let t = this.map.get(e.audioSSRC),
                    s = {
                        ...this.map.get(e.audioSSRC),
                        ...e
                    };
                if (this.map.set(e.audioSSRC, s), !t) this.emit("create", s);
                this.emit("update", t, s)
            }
            get(e) {
                if (typeof e === "number") return this.map.get(e);
                for (let t of this.map.values())
                    if (t.userId === e) return t;
                return
            }
            delete(e) {
                if (typeof e === "number") {
                    let t = this.map.get(e);
                    if (t) this.map.delete(e), this.emit("delete", t);
                    return t
                }
                for (let [t, s] of this.map.entries())
                    if (s.userId === e) return this.map.delete(t), this.emit("delete", s), s;
                return
            }
        },
        Ft = a("events"),
        Me = class e extends Ft.EventEmitter {
            static {
                o(this, "SpeakingMap")
            }
            static DELAY = 100;
            users;
            speakingTimeouts;
            constructor() {
                super();
                this.users = new Map, this.speakingTimeouts = new Map
            }
            onPacket(t) {
                let s = this.speakingTimeouts.get(t);
                if (s) clearTimeout(s);
                else this.users.set(t, Date.now()), this.emit("start", t);
                this.startTimeout(t)
            }
            startTimeout(t) {
                this.speakingTimeouts.set(t, setTimeout(() => {
                    this.emit("end", t), this.speakingTimeouts.delete(t), this.users.delete(t)
                }, e.DELAY))
            }
        },
        Ut = A.Buffer.from([190, 222]),
        C = 4,
        se = 16,
        Ne = class {
            static {
                o(this, "VoiceReceiver")
            }
            voiceConnection;
            ssrcMap;
            subscriptions;
            connectionData;
            speaking;
            constructor(e) {
                this.voiceConnection = e, this.ssrcMap = new xe, this.speaking = new Me, this.subscriptions = new Map, this.connectionData = {}, this.onWsPacket = this.onWsPacket.bind(this), this.onUdpMessage = this.onUdpMessage.bind(this)
            }
            onWsPacket(e) {
                if (e.op === te.VoiceOpcodes.ClientDisconnect) this.ssrcMap.delete(e.d.user_id);
                else if (e.op === te.VoiceOpcodes.Speaking) this.ssrcMap.update({
                    userId: e.d.user_id,
                    audioSSRC: e.d.ssrc
                })
            }
            decrypt(e, t, s, i) {
                e.copy(s, 0, e.length - C);
                let r = 12;
                if (e.readUint8() >> 4 & 1) r += 4;
                let c = e.subarray(0, r),
                    u = e.subarray(r, e.length - se - C),
                    h = e.subarray(e.length - se - C, e.length - C);
                switch (t) {
                    case "aead_aes256_gcm_rtpsize": {
                        let l = Vt.default.createDecipheriv("aes-256-gcm", i, s);
                        return l.setAAD(c), l.setAuthTag(h), A.Buffer.concat([l.update(u), l.final()])
                    }
                    case "aead_xchacha20_poly1305_rtpsize":
                        return A.Buffer.from(W.crypto_aead_xchacha20poly1305_ietf_decrypt(A.Buffer.concat([u, h]), c, s, i));
                    default:
                        throw RangeError(`Unsupported decryption method: ${t}`)
                }
            }
            parsePacket(e, t, s, i, r) {
                let n = this.decrypt(e, t, s, i);
                if (!n) throw Error("Failed to parse packet");
                if (e[0] && Boolean(e[0] & 32)) {
                    let u = n[n.length - 1];
                    if (u < n.length) n = n.subarray(0, n.length - u)
                }
                if (e.subarray(12, 14).compare(Ut) === 0) {
                    let u = e.subarray(14).readUInt16BE();
                    n = n.subarray(4 * u)
                }
                if (this.voiceConnection.state.status === "ready" && (this.voiceConnection.state.networking.state.code === 4 || this.voiceConnection.state.networking.state.code === 5)) {
                    let u = this.voiceConnection.state.networking.state.dave;
                    if (u) n = u.decrypt(n, r)
                }
                return n
            }
            onUdpMessage(e) {
                if (e.length <= 8) return;
                let t = e.readUInt32BE(8),
                    s = this.ssrcMap.get(t);
                if (!s) return;
                this.speaking.onPacket(s.userId);
                let i = this.subscriptions.get(s.userId);
                if (!i) return;
                if (this.connectionData.encryptionMode && this.connectionData.nonceBuffer && this.connectionData.secretKey) {
                    if ((e[1] & 127) !== j) return;
                    if (e[0] >> 6 !== 2) return;
                    try {
                        let n = this.parsePacket(e, this.connectionData.encryptionMode, this.connectionData.nonceBuffer, this.connectionData.secretKey, s.userId);
                        if (n) i.push(n)
                    } catch (n) {
                        i.destroy(n)
                    }
                }
            }
            subscribe(e, t) {
                let s = this.subscriptions.get(e);
                if (s) return s;
                let i = new Ve({
                    ...H(),
                    ...t
                });
                return i.once("close", () => this.subscriptions.delete(e)), this.subscriptions.set(e, i), i
            }
        },
        Fe = ((e) => (e.Connecting = "connecting", e.Destroyed = "destroyed", e.Disconnected = "disconnected", e.Ready = "ready", e.Signalling = "signalling", e))(Fe || {}),
        Ue = ((e) => (e[e.WebSocketClose = 0] = "WebSocketClose", e[e.AdapterUnavailable = 1] = "AdapterUnavailable", e[e.EndpointRemoved = 2] = "EndpointRemoved", e[e.Manual = 3] = "Manual", e))(Ue || {}),
        Be = class extends lt.EventEmitter {
            static {
                o(this, "VoiceConnection")
            }
            rejoinAttempts;
            _state;
            joinConfig;
            packets;
            receiver;
            debug;
            options;
            constructor(e, t) {
                super();
                this.debug = t.debug ? (i) => this.emit("debug", i) : null, this.rejoinAttempts = 0, this.receiver = new Ne(this), this.onNetworkingClose = this.onNetworkingClose.bind(this), this.onNetworkingStateChange = this.onNetworkingStateChange.bind(this), this.onNetworkingError = this.onNetworkingError.bind(this), this.onNetworkingDebug = this.onNetworkingDebug.bind(this), this.onNetworkingTransitioned = this.onNetworkingTransitioned.bind(this);
                let s = t.adapterCreator({
                    onVoiceServerUpdate: o((i) => this.addServerPacket(i), "onVoiceServerUpdate"),
                    onVoiceStateUpdate: o((i) => this.addStatePacket(i), "onVoiceStateUpdate"),
                    destroy: o(() => this.destroy(!1), "destroy")
                });
                this._state = {
                    status: "signalling",
                    adapter: s
                }, this.packets = {
                    server: void 0,
                    state: void 0
                }, this.joinConfig = e, this.options = t
            }
            get state() {
                return this._state
            }
            set state(e) {
                let t = this._state,
                    s = Reflect.get(t, "networking"),
                    i = Reflect.get(e, "networking"),
                    r = Reflect.get(t, "subscription"),
                    n = Reflect.get(e, "subscription");
                if (s !== i) {
                    if (s) s.on("error", v), s.off("debug", this.onNetworkingDebug), s.off("error", this.onNetworkingError), s.off("close", this.onNetworkingClose), s.off("stateChange", this.onNetworkingStateChange), s.off("transitioned", this.onNetworkingTransitioned), s.destroy();
                    if (i) this.updateReceiveBindings(i.state, s?.state)
                }
                if (e.status === "ready") this.rejoinAttempts = 0;
                else if (e.status === "destroyed") {
                    for (let c of this.receiver.subscriptions.values())
                        if (!c.destroyed) c.destroy()
                }
                if (t.status !== "destroyed" && e.status === "destroyed") t.adapter.destroy();
                if (this._state = e, r && r !== n) r.unsubscribe();
                if (this.emit("stateChange", t, e), t.status !== e.status) this.emit(e.status, t, e)
            }
            addServerPacket(e) {
                if (this.packets.server = e, e.endpoint) this.configureNetworking();
                else if (this.state.status !== "destroyed") this.state = {
                    ...this.state,
                    status: "disconnected",
                    reason: 2
                }
            }
            addStatePacket(e) {
                if (this.packets.state = e, e.self_deaf !== void 0) this.joinConfig.selfDeaf = e.self_deaf;
                if (e.self_mute !== void 0) this.joinConfig.selfMute = e.self_mute;
                if (e.channel_id) this.joinConfig.channelId = e.channel_id
            }
            updateReceiveBindings(e, t) {
                let s = Reflect.get(t ?? {}, "ws"),
                    i = Reflect.get(e, "ws"),
                    r = Reflect.get(t ?? {}, "udp"),
                    n = Reflect.get(e, "udp");
                if (s !== i) s?.off("packet", this.receiver.onWsPacket), i?.on("packet", this.receiver.onWsPacket);
                if (r !== n) r?.off("message", this.receiver.onUdpMessage), n?.on("message", this.receiver.onUdpMessage);
                this.receiver.connectionData = Reflect.get(e, "connectionData") ?? {}
            }
            configureNetworking() {
                let {
                    server: e,
                    state: t
                } = this.packets;
                if (!e || !t || this.state.status === "destroyed" || !e.endpoint) return;
                let s = new Re({
                    endpoint: e.endpoint,
                    serverId: e.guild_id,
                    token: e.token,
                    sessionId: t.session_id,
                    userId: t.user_id,
                    channelId: t.channel_id
                }, {
                    debug: Boolean(this.debug),
                    daveEncryption: this.options.daveEncryption ?? !0,
                    decryptionFailureTolerance: this.options.decryptionFailureTolerance
                });
                s.once("close", this.onNetworkingClose), s.on("stateChange", this.onNetworkingStateChange), s.on("error", this.onNetworkingError), s.on("debug", this.onNetworkingDebug), s.on("transitioned", this.onNetworkingTransitioned), this.state = {
                    ...this.state,
                    status: "connecting",
                    networking: s
                }
            }
            onNetworkingClose(e) {
                if (this.state.status === "destroyed") return;
                if (e === 4014) this.state = {
                    ...this.state,
                    status: "disconnected",
                    reason: 0,
                    closeCode: e
                };
                else if (this.state = {
                        ...this.state,
                        status: "signalling"
                    }, this.rejoinAttempts++, !this.state.adapter.sendPayload(_(this.joinConfig))) this.state = {
                    ...this.state,
                    status: "disconnected",
                    reason: 1
                }
            }
            onNetworkingStateChange(e, t) {
                if (this.updateReceiveBindings(t, e), e.code === t.code) return;
                if (this.state.status !== "connecting" && this.state.status !== "ready") return;
                if (t.code === 4) this.state = {
                    ...this.state,
                    status: "ready"
                };
                else if (t.code !== 6) this.state = {
                    ...this.state,
                    status: "connecting"
                }
            }
            onNetworkingError(e) {
                this.emit("error", e)
            }
            onNetworkingDebug(e) {
                this.debug?.(`[NW] ${e}`)
            }
            onNetworkingTransitioned(e) {
                this.emit("transitioned", e)
            }
            prepareAudioPacket(e) {
                let t = this.state;
                if (t.status !== "ready") return;
                return t.networking.prepareAudioPacket(e)
            }
            dispatchAudio() {
                let e = this.state;
                if (e.status !== "ready") return;
                return e.networking.dispatchAudio()
            }
            playOpusPacket(e) {
                let t = this.state;
                if (t.status !== "ready") return;
                return t.networking.prepareAudioPacket(e), t.networking.dispatchAudio()
            }
            destroy(e = !0) {
                if (this.state.status === "destroyed") throw Error("Cannot destroy VoiceConnection - it has already been destroyed");
                if (O(this.joinConfig.guildId, this.joinConfig.group) === this) de(this);
                if (e) this.state.adapter.sendPayload(_({
                    ...this.joinConfig,
                    channelId: null
                }));
                this.state = {
                    status: "destroyed"
                }
            }
            disconnect() {
                if (this.state.status === "destroyed" || this.state.status === "signalling") return !1;
                if (this.joinConfig.channelId = null, !this.state.adapter.sendPayload(_(this.joinConfig))) return this.state = {
                    adapter: this.state.adapter,
                    subscription: this.state.subscription,
                    status: "disconnected",
                    reason: 1
                }, !1;
                return this.state = {
                    adapter: this.state.adapter,
                    reason: 3,
                    status: "disconnected"
                }, !0
            }
            rejoin(e) {
                if (this.state.status === "destroyed") return !1;
                let t = this.state.status !== "ready";
                if (t) this.rejoinAttempts++;
                if (Object.assign(this.joinConfig, e), this.state.adapter.sendPayload(_(this.joinConfig))) {
                    if (t) this.state = {
                        ...this.state,
                        status: "signalling"
                    };
                    return !0
                }
                return this.state = {
                    adapter: this.state.adapter,
                    subscription: this.state.subscription,
                    status: "disconnected",
                    reason: 1
                }, !1
            }
            setSpeaking(e) {
                if (this.state.status !== "ready") return !1;
                return this.state.networking.setSpeaking(e)
            }
            subscribe(e) {
                if (this.state.status === "destroyed") return;
                let t = e.subscribe(this);
                return this.state = {
                    ...this.state,
                    subscription: t
                }, t
            }
            get ping() {
                if (this.state.status === "ready" && this.state.networking.state.code === 4) return {
                    ws: this.state.networking.state.ws.ping,
                    udp: this.state.networking.state.udp.ping
                };
                return {
                    ws: void 0,
                    udp: void 0
                }
            }
            get voicePrivacyCode() {
                if (this.state.status === "ready" && this.state.networking.state.code === 4) return this.state.networking.state.dave?.voicePrivacyCode ?? void 0;
                return
            }
            async getVerificationCode(e) {
                if (this.state.status === "ready" && this.state.networking.state.code === 4 && this.state.networking.state.dave) return this.state.networking.state.dave.getVerificationCode(e);
                throw Error("Session not available")
            }
            onSubscriptionRemoved(e) {
                if (this.state.status !== "destroyed" && this.state.subscription === e) this.state = {
                    ...this.state,
                    subscription: void 0
                }
            }
        };

    function qe(e, t) {
        let s = _(e),
            i = O(e.guildId, e.group);
        if (i && i.state.status !== "destroyed") {
            if (i.state.status === "disconnected") i.rejoin({
                channelId: e.channelId,
                selfDeaf: e.selfDeaf,
                selfMute: e.selfMute
            });
            else if (!i.state.adapter.sendPayload(s)) i.state = {
                ...i.state,
                status: "disconnected",
                reason: 1
            };
            return i
        }
        let r = new Be(e, t);
        if (ue(r), r.state.status !== "destroyed" && !r.state.adapter.sendPayload(s)) r.state = {
            ...r.state,
            status: "disconnected",
            reason: 1
        };
        return r
    }
    o(qe, "createVoiceConnection");

    function We(e) {
        let t = {
            selfDeaf: !0,
            selfMute: !1,
            group: "default",
            ...e
        };
        return qe(t, {
            adapterCreator: e.adapterCreator,
            debug: e.debug,
            daveEncryption: e.daveEncryption,
            decryptionFailureTolerance: e.decryptionFailureTolerance
        })
    }
    o(We, "joinVoiceChannel");
    var Bt = a("stream"),
        y = p(a("prism-media")),
        g = p(a("prism-media")),
        qt = ["-analyzeduration", "0", "-loglevel", "0", "-f", "s16le", "-ar", "48000", "-ac", "2"],
        Wt = ["-analyzeduration", "0", "-loglevel", "0", "-acodec", "libopus", "-f", "opus", "-ar", "48000", "-ac", "2"],
        L = ((e) => (e.Arbitrary = "arbitrary", e.OggOpus = "ogg/opus", e.Opus = "opus", e.Raw = "raw", e.WebmOpus = "webm/opus", e))(L || {}),
        $e = ((e) => (e.FFmpegOgg = "ffmpeg ogg", e.FFmpegPCM = "ffmpeg pcm", e.InlineVolume = "volume transformer", e.OggOpusDemuxer = "ogg/opus demuxer", e.OpusDecoder = "opus decoder", e.OpusEncoder = "opus encoder", e.WebmOpusDemuxer = "webm/opus demuxer", e))($e || {}),
        je = class {
            static {
                o(this, "Node")
            }
            edges = [];
            type;
            constructor(e) {
                this.type = e
            }
            addEdge(e) {
                this.edges.push({
                    ...e,
                    from: this
                })
            }
        },
        $t = null;

    function z(e) {
        let t = ($t ??= Le()).get(e);
        if (!t) throw Error(`Node type '${e}' does not exist!`);
        return t
    }
    o(z, "getNode");

    function He() {
        try {
            return g.default.FFmpeg.getInfo().output.includes("--enable-libopus")
        } catch {}
        return !1
    }
    o(He, "canEnableFFmpegOptimizations");

    function Le() {
        let e = new Map;
        for (let s of Object.values(L)) e.set(s, new je(s));
        e.get("raw").addEdge({
            type: "opus encoder",
            to: e.get("opus"),
            cost: 1.5,
            transformer: o(() => new g.default.opus.Encoder({
                rate: 48000,
                channels: 2,
                frameSize: 960
            }), "transformer")
        }), e.get("opus").addEdge({
            type: "opus decoder",
            to: e.get("raw"),
            cost: 1.5,
            transformer: o(() => new g.default.opus.Decoder({
                rate: 48000,
                channels: 2,
                frameSize: 960
            }), "transformer")
        }), e.get("ogg/opus").addEdge({
            type: "ogg/opus demuxer",
            to: e.get("opus"),
            cost: 1,
            transformer: o(() => new g.default.opus.OggDemuxer, "transformer")
        }), e.get("webm/opus").addEdge({
            type: "webm/opus demuxer",
            to: e.get("opus"),
            cost: 1,
            transformer: o(() => new g.default.opus.WebmDemuxer, "transformer")
        });
        let t = {
            type: "ffmpeg pcm",
            to: e.get("raw"),
            cost: 2,
            transformer: o((s) => new g.default.FFmpeg({
                args: ["-i", typeof s === "string" ? s : "-", ...qt]
            }), "transformer")
        };
        if (e.get("arbitrary").addEdge(t), e.get("ogg/opus").addEdge(t), e.get("webm/opus").addEdge(t), e.get("raw").addEdge({
                type: "volume transformer",
                to: e.get("raw"),
                cost: 0.5,
                transformer: o(() => new g.default.VolumeTransformer({
                    type: "s16le"
                }), "transformer")
            }), He()) {
            let s = {
                type: "ffmpeg ogg",
                to: e.get("ogg/opus"),
                cost: 2,
                transformer: o((i) => new g.default.FFmpeg({
                    args: ["-i", typeof i === "string" ? i : "-", ...Wt]
                }), "transformer")
            };
            e.get("arbitrary").addEdge(s), e.get("ogg/opus").addEdge(s), e.get("webm/opus").addEdge(s)
        }
        return e
    }
    o(Le, "initializeNodes");

    function G(e, t, s = z("opus"), i = [], r = 5) {
        if (e === s && t(i)) return {
            cost: 0
        };
        else if (r === 0) return {
            cost: Number.POSITIVE_INFINITY
        };
        let n;
        for (let c of e.edges) {
            if (n && c.cost > n.cost) continue;
            let u = G(c.to, t, s, [...i, c], r - 1),
                h = c.cost + u.cost;
            if (!n || h < n.cost) n = {
                cost: h,
                edge: c,
                next: u
            }
        }
        return n ?? {
            cost: Number.POSITIVE_INFINITY
        }
    }
    o(G, "findPath");

    function ze(e) {
        let t = [],
            s = e;
        while (s?.edge) t.push(s.edge), s = s.next;
        return t
    }
    o(ze, "constructPipeline");

    function Ge(e, t) {
        return ze(G(z(e), t))
    }
    o(Ge, "findPipeline");
    var U = class {
            static {
                o(this, "AudioResource")
            }
            playStream;
            edges;
            metadata;
            volume;
            encoder;
            audioPlayer;
            playbackDuration = 0;
            started = !1;
            silencePaddingFrames;
            silenceRemaining = -1;
            constructor(e, t, s, i) {
                this.edges = e, this.playStream = t.length > 1 ? (0, Bt.pipeline)(t, v) : t[0], this.metadata = s, this.silencePaddingFrames = i;
                for (let r of t)
                    if (r instanceof y.default.VolumeTransformer) this.volume = r;
                    else if (r instanceof y.default.opus.Encoder) this.encoder = r;
                this.playStream.once("readable", () => this.started = !0)
            }
            get readable() {
                if (this.silenceRemaining === 0) return !1;
                let e = this.playStream.readable;
                if (!e) {
                    if (this.silenceRemaining === -1) this.silenceRemaining = this.silencePaddingFrames;
                    return this.silenceRemaining !== 0
                }
                return e
            }
            get ended() {
                return this.playStream.readableEnded || this.playStream.destroyed || this.silenceRemaining === 0
            }
            read() {
                if (this.silenceRemaining === 0) return null;
                else if (this.silenceRemaining > 0) return this.silenceRemaining--, k;
                let e = this.playStream.read();
                if (e) this.playbackDuration += 20;
                return e
            }
        },
        jt = o((e) => e.some((t) => t.type === "volume transformer"), "VOLUME_CONSTRAINT"),
        Ht = o(() => !0, "NO_CONSTRAINT");

    function Ye(e) {
        if (e instanceof y.default.opus.Encoder) return {
            streamType: "opus",
            hasVolume: !1
        };
        else if (e instanceof y.default.opus.Decoder) return {
            streamType: "raw",
            hasVolume: !1
        };
        else if (e instanceof y.default.VolumeTransformer) return {
            streamType: "raw",
            hasVolume: !0
        };
        else if (e instanceof y.default.opus.OggDemuxer) return {
            streamType: "opus",
            hasVolume: !1
        };
        else if (e instanceof y.default.opus.WebmDemuxer) return {
            streamType: "opus",
            hasVolume: !1
        };
        return {
            streamType: "arbitrary",
            hasVolume: !1
        }
    }
    o(Ye, "inferStreamType");

    function Ke(e, t = {}) {
        let s = t.inputType,
            i = Boolean(t.inlineVolume);
        if (typeof e === "string") s = "arbitrary";
        else if (s === void 0) {
            let c = Ye(e);
            s = c.streamType, i = i && !c.hasVolume
        }
        let r = Ge(s, i ? jt : Ht);
        if (r.length === 0) {
            if (typeof e === "string") throw Error(`Invalid pipeline constructed for string resource '${e}'`);
            return new U([], [e], t.metadata ?? null, t.silencePaddingFrames ?? 5)
        }
        let n = r.map((c) => c.transformer(e));
        if (typeof e !== "string") n.unshift(e);
        return new U(r, n, t.metadata ?? null, t.silencePaddingFrames ?? 5)
    }
    o(Ke, "createAudioResource");
    var Lt = a("crypto"),
        B = a("path"),
        zt = p(a("prism-media"));

    function Y(e, t, s) {
        if (s === 0) return;
        let i = (0, B.resolve)(e, "./package.json");
        try {
            let r = a(i);
            if (r.name !== t) throw Error("package.json does not match");
            return r
        } catch {
            return Y((0, B.resolve)(e, ".."), t, s - 1)
        }
    }
    o(Y, "findPackageJSON");

    function Je(e) {
        try {
            if (e === "@discordjs/voice") return "0.19.2";
            return Y((0, B.dirname)(a.resolve(e)), e, 3)?.version ?? "not found"
        } catch {
            return "not found"
        }
    }
    o(Je, "version");

    function Xe() {
        let e = [],
            t = o((s) => e.push(`- ${s}: ${Je(s)}`), "addVersion");
        e.push("Core Dependencies"), t("@discordjs/voice"), t("prism-media"), e.push(""), e.push("Opus Libraries"), t("@discordjs/opus"), t("opusscript"), e.push(""), e.push("Encryption Libraries"), e.push(`- native crypto support for aes-256-gcm: ${(0,Lt.getCiphers)().includes("aes-256-gcm")?"yes":"no"}`), t("sodium-native"), t("sodium"), t("libsodium-wrappers"), t("@stablelib/xchacha20poly1305"), t("@noble/ciphers"), e.push(""), e.push("DAVE Libraries"), t("@snazzah/davey"), e.push(""), e.push("FFmpeg");
        try {
            let s = zt.default.FFmpeg.getInfo();
            e.push(`- version: ${s.version}`), e.push(`- libopus: ${s.output.includes("--enable-libopus")?"yes":"no"}`)
        } catch {
            e.push("- not found")
        }
        return ["-".repeat(50), ...e, "-".repeat(50)].join(`
`)
    }
    o(Xe, "generateDependencyReport");
    var Gt = a("events");

    function Ze(e) {
        let t = new AbortController,
            s = setTimeout(() => t.abort(), e);
        return t.signal.addEventListener("abort", () => clearTimeout(s)), [t, t.signal]
    }
    o(Ze, "abortAfter");
    async function Qe(e, t, s) {
        if (e.state.status !== t) {
            let [i, r] = typeof s === "number" ? Ze(s) : [void 0, s];
            try {
                await (0, Gt.once)(e, t, {
                    signal: r
                })
            } finally {
                i?.abort()
            }
        }
        return e
    }
    o(Qe, "entersState");
    var ie = a("buffer"),
        Yt = p(a("process")),
        Kt = a("stream"),
        re = p(a("prism-media"));

    function K(e) {
        let t = e.readUInt8(9),
            s = e.readUInt32LE(12);
        return t === 2 && s === 48000
    }
    o(K, "validateDiscordOpusHead");
    async function et(e, t = 1024, s = K) {
        return new Promise((i, r) => {
            if (e.readableObjectMode) {
                r(Error("Cannot probe a readable stream in object mode"));
                return
            }
            if (e.readableEnded) {
                r(Error("Cannot probe a stream that has ended"));
                return
            }
            let n = ie.Buffer.alloc(0),
                c, u = o((f) => {
                    if (e.off("data", R), e.off("close", w), e.off("end", w), e.pause(), c = f, e.readableEnded) i({
                        stream: Kt.Readable.from(n),
                        type: f
                    });
                    else {
                        if (n.length > 0) e.push(n);
                        i({
                            stream: e,
                            type: f
                        })
                    }
                }, "finish"),
                h = o((f) => (st) => {
                    if (s(st)) u(f)
                }, "foundHead"),
                l = new re.default.opus.WebmDemuxer;
            l.once("error", v), l.on("head", h("webm/opus"));
            let T = new re.default.opus.OggDemuxer;
            T.once("error", v), T.on("head", h("ogg/opus"));
            let w = o(() => {
                    if (!c) u("arbitrary")
                }, "onClose"),
                R = o((f) => {
                    if (n = ie.Buffer.concat([n, f]), l.write(f), T.write(f), n.length >= t) e.off("data", R), e.pause(), Yt.default.nextTick(w)
                }, "onData");
            e.once("error", r), e.on("data", R), e.once("close", w), e.once("end", w)
        })
    }
    o(et, "demuxProbe");
    var Jt = "0.19.2"
});
export default Xt();
