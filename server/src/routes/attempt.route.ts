import { Router } from "express";
import { complete,finishResearchController ,submit,getAttemptController,getHistory} from "../controllers/attempt.controller.js";
import { uploadAudio } from "../middleware/upload.middleware.js";
import { submitAudio } from "../controllers/attempt.controller.js";


const router = Router();

router.get("/history", getHistory);


router.get("/:attemptId", getAttemptController);


router.patch(
  "/:attemptId/complete",complete
);

router.patch(
  "/:attemptId/research/complete",
  finishResearchController
);

router.post(
  "/:attemptId/submit",
  submit
);

router.post(
  "/:attemptId/submit-audio",
  uploadAudio,
  submitAudio
);
export default router;