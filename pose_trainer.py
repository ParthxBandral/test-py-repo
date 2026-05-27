import time
from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np


def calculate_angle(a, b, c):
    """Calculate the angle at point b formed by points a-b-c.

    Uses the Law of Cosines with vector math and clamps values to avoid
    numerical instability. This is safer than using raw arccos on values
    outside [-1, 1].
    """
    a = np.array(a, dtype=np.float32)
    b = np.array(b, dtype=np.float32)
    c = np.array(c, dtype=np.float32)

    ba = a - b
    bc = c - b

    # normalize vectors
    ba_norm = ba / (np.linalg.norm(ba) + 1e-8)
    bc_norm = bc / (np.linalg.norm(bc) + 1e-8)

    cosine_angle = np.dot(ba_norm, bc_norm)
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)

    angle = np.degrees(np.arccos(cosine_angle))
    return angle


def get_landmark_point(landmarks, idx, image_width, image_height):
    """Convert normalized landmark coordinates to pixel coordinates."""
    landmark = landmarks[idx]
    return int(landmark.x * image_width), int(landmark.y * image_height)


def draw_angle_text(frame, position, angle, label):
    cv2.putText(
        frame,
        f"{label}: {int(angle)}°",
        position,
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (255, 255, 255),
        2,
        cv2.LINE_AA,
    )


def compute_joint_angles(landmarks, image_width, image_height):
    """Compute shoulder, elbow, and knee angles for both sides."""
    # MediaPipe Pose landmark IDs
    LEFT_SHOULDER = 11
    LEFT_ELBOW = 13
    LEFT_WRIST = 15
    LEFT_HIP = 23
    LEFT_KNEE = 25
    LEFT_ANKLE = 27

    RIGHT_SHOULDER = 12
    RIGHT_ELBOW = 14
    RIGHT_WRIST = 16
    RIGHT_HIP = 24
    RIGHT_KNEE = 26
    RIGHT_ANKLE = 28

    left_shoulder = get_landmark_point(landmarks, LEFT_SHOULDER, image_width, image_height)
    left_elbow = get_landmark_point(landmarks, LEFT_ELBOW, image_width, image_height)
    left_wrist = get_landmark_point(landmarks, LEFT_WRIST, image_width, image_height)
    left_hip = get_landmark_point(landmarks, LEFT_HIP, image_width, image_height)
    left_knee = get_landmark_point(landmarks, LEFT_KNEE, image_width, image_height)
    left_ankle = get_landmark_point(landmarks, LEFT_ANKLE, image_width, image_height)

    right_shoulder = get_landmark_point(landmarks, RIGHT_SHOULDER, image_width, image_height)
    right_elbow = get_landmark_point(landmarks, RIGHT_ELBOW, image_width, image_height)
    right_wrist = get_landmark_point(landmarks, RIGHT_WRIST, image_width, image_height)
    right_hip = get_landmark_point(landmarks, RIGHT_HIP, image_width, image_height)
    right_knee = get_landmark_point(landmarks, RIGHT_KNEE, image_width, image_height)
    right_ankle = get_landmark_point(landmarks, RIGHT_ANKLE, image_width, image_height)

    left_elbow_angle = calculate_angle(left_shoulder, left_elbow, left_wrist)
    right_elbow_angle = calculate_angle(right_shoulder, right_elbow, right_wrist)
    left_shoulder_angle = calculate_angle(left_elbow, left_shoulder, left_hip)
    right_shoulder_angle = calculate_angle(right_elbow, right_shoulder, right_hip)
    left_knee_angle = calculate_angle(left_hip, left_knee, left_ankle)
    right_knee_angle = calculate_angle(right_hip, right_knee, right_ankle)

    return {
        "left_elbow": left_elbow_angle,
        "right_elbow": right_elbow_angle,
        "left_shoulder": left_shoulder_angle,
        "right_shoulder": right_shoulder_angle,
        "left_knee": left_knee_angle,
        "right_knee": right_knee_angle,
    }


def main():
    print("Starting AI Fitness Trainer")
    print("Press 'Q' to quit")
    print("Make sure your whole body is visible to the webcam.")

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        print("ERROR: Cannot open webcam. Check camera connection and index.")
        return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils

    # Proper MediaPipe Pose configuration for stable tracking on CPU
    pose = mp_pose.Pose(
        static_image_mode=False,
        model_complexity=1,
        smooth_landmarks=True,
        enable_segmentation=False,
        min_detection_confidence=0.6,
        min_tracking_confidence=0.6,
    )

    rep_count = 0
    squat_stage = None
    last_print_time = time.time()
    fps = 0.0
    prev_time = time.time()

    while True:
        success, frame = cap.read()
        if not success:
            print("ERROR: Failed to read frame from webcam.")
            break

        frame = cv2.flip(frame, 1)
        image_height, image_width = frame.shape[:2]

        # Convert BGR to RGB before passing to MediaPipe.
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Improve performance by marking the image as not writeable.
        rgb_frame.flags.writeable = False
        results = pose.process(rgb_frame)
        rgb_frame.flags.writeable = True

        if results.pose_landmarks:
            mp_drawing.draw_landmarks(
                frame,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=3),
                mp_drawing.DrawingSpec(color=(255, 255, 255), thickness=2),
            )

            landmarks = results.pose_landmarks.landmark
            angles = compute_joint_angles(landmarks, image_width, image_height)

            # Use the stronger visible side for squat counting.
            knee_angle = min(angles["left_knee"], angles["right_knee"])
            hip_angle = min(angles["left_shoulder"], angles["right_shoulder"])
            elbow_angle = min(angles["left_elbow"], angles["right_elbow"])

            draw_angle_text(frame, (20, 30), knee_angle, "Knee")
            draw_angle_text(frame, (20, 60), hip_angle, "Hip")
            draw_angle_text(frame, (20, 90), elbow_angle, "Elbow")

            if knee_angle < 100:
                if squat_stage != "down":
                    squat_stage = "down"
                    print(f"DEBUG: Squat down detected (knee_angle={knee_angle:.1f})")
            if knee_angle > 160 and squat_stage == "down":
                squat_stage = "up"
                rep_count += 1
                print(f"REP {rep_count} counted (knee_angle={knee_angle:.1f})")

            cv2.putText(
                frame,
                f"Squats: {rep_count}",
                (20, image_height - 20),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.0,
                (0, 255, 255),
                2,
                cv2.LINE_AA,
            )
        else:
            if time.time() - last_print_time > 2.0:
                print("DEBUG: Pose not detected. Adjust lighting or move closer.")
                last_print_time = time.time()

        current_time = time.time()
        fps = 0.9 * fps + 0.1 * (1.0 / (current_time - prev_time + 1e-8))
        prev_time = current_time

        cv2.putText(
            frame,
            f"FPS: {int(fps)}",
            (image_width - 120, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 0),
            2,
            cv2.LINE_AA,
        )

        cv2.imshow("AI Fitness Trainer - Squat Counter", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    pose.close()
    print("Trainer stopped. Final squat count:", rep_count)


if __name__ == "__main__":
    main()
