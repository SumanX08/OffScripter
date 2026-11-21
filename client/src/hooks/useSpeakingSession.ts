import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthenticatedApi } from "./useAuthApi";
import { useRealtimeTranscription } from "./useRealTimeTranscription";
import { useAudioRecorder } from "./useAudioRecorder";
import { useSpeakingSubmission } from "./useSpeakingSubmission";
import { useSpeakingTimer } from "./useSpeakingTimer";
import type { AttemptResponse } from "../types/speaking.types";

export function useSpeakingSession() {
 const {attemptId} = useParams<{attemptId:string}>();
 const api = useAuthenticatedApi();
 const navigate = useNavigate();
 const [attempt, setAttempt] = useState<AttemptResponse | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const autoSubmitTriggeredRef = useRef(false);
 const {startTranscription, stopTranscription, cancelTranscription} = useRealtimeTranscription();
 const {startRecording, stopRecording, stopMicrophone, cleanupRecording, togglePause, paused, recordingReady} = useAudioRecorder(setError);
 const {ending, finalized, evaluationStage, handleEndSession, submittedRef} = useSpeakingSubmission({attemptId, stopRecording, stopTranscription, stopMicrophone, setError});
 const {timeLeft, elapsedTime, setTimeLeft, setElapsedTime} = useSpeakingTimer(!loading && recordingReady && !paused && !ending && !finalized);
 useEffect(() => {
   let current = true;
   if (!attemptId) { setError("Speaking session not found."); setLoading(false); return; }
   const loadAttempt = async () => {
     try {
       setLoading(true); setError("");
       const response = await api.get(`/attempts/${attemptId}`);
       if (!current) return;
       const data: AttemptResponse = response.data.data;
       if (!data) throw new Error("Attempt not found");
       if (data.stage === "RESEARCHING" || data.stage === "SUBMITTED") {
         navigate(`/challenge/${attemptId}/${data.stage === "RESEARCHING" ? "research" : "results"}`, {replace:true}); return;
       }
       setAttempt(data); setTimeLeft(data.topic.speakingTime); setElapsedTime(0);
       const stream = await startRecording(() => current);
       if (stream && current) void startTranscription(stream, attemptId).catch(error => console.error("[REALTIME] Initialization failed:", error));
     } catch (error) {
       if (current) setError(error instanceof Error ? error.message : "We couldn't load this speaking session.");
     } finally { if (current) setLoading(false); }
   };
   void loadAttempt();
   return () => { current = false; cancelTranscription(); cleanupRecording(); };
 }, [api, attemptId, navigate, startRecording, startTranscription, cancelTranscription, cleanupRecording, setTimeLeft, setElapsedTime]);
 useEffect(() => {
   if (!loading && timeLeft === 0 && attempt && !ending && !finalized && !paused && recordingReady && !autoSubmitTriggeredRef.current && !submittedRef.current) {
     autoSubmitTriggeredRef.current = true;
     void handleEndSession();
   }
 }, [loading,timeLeft,attempt,ending,finalized,paused,recordingReady,handleEndSession,submittedRef]);
 const handlePauseToggle = useCallback(() => {
   if (ending || finalized || timeLeft <= 0) return;
   if (togglePause() === "paused") cancelTranscription();
 }, [ending,finalized,timeLeft,togglePause,cancelTranscription]);
 return {attempt,loading,error,ending,finalized,paused,recordingReady,evaluationStage,timeLeft,elapsedTime,handlePauseToggle,handleEndSession,handleBackToChallenge:()=>navigate("/challenge")};
}
