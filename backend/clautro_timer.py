import cv2
import numpy as np
import time

# ---------- LIGHTWEIGHT DETECTORS ----------
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
eye_cascade  = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")
smile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_smile.xml")


def detect_mood_lightweight(face_gray, anxiety_level):
    eyes = eye_cascade.detectMultiScale(face_gray, scaleFactor=1.15, minNeighbors=10)
    smiles = smile_cascade.detectMultiScale(face_gray, scaleFactor=1.6, minNeighbors=22)

    if anxiety_level >= 7:
        return "Anxious 😰", (0, 0, 255)

    if len(smiles) > 0:
        return "Happy 🙂", (0, 255, 0)

    if len(eyes) >= 2:
        return "Surprised 😮", (255, 255, 255)

    if len(eyes) == 0:
        return "Calm / Sleepy 😴", (255, 200, 0)

    return "Neutral 😐", (255, 255, 0)


cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Camera not opening")
    exit()

# --- Settings ---
MIN_SCALE = 0.55   # calm => shrink
MAX_SCALE = 1.25   # anxious => expand
CHECK_INTERVAL = 30  # seconds

current_scale = 1.0
target_scale = 1.0

# ✅ initial anxiety input
while True:
    try:
        anxiety = int(input("Enter initial anxiety (0-10): "))
        if 0 <= anxiety <= 10:
            break
        print("Enter between 0 to 10 only.")
    except:
        print("Invalid input. Enter number 0-10.")

print("\nStarted. Every 30 sec you'll be asked again. Press Q to quit.\n")
last_check_time = time.time()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.resize(frame, (800, 500))
    h, w = frame.shape[:2]

    # ✅ every 30 seconds ask user anxiety
    now = time.time()
    if now - last_check_time >= CHECK_INTERVAL:
        last_check_time = now

        while True:
            try:
                new_anxiety = int(input("Update anxiety (0-10): "))
                if 0 <= new_anxiety <= 10:
                    anxiety = new_anxiety
                    break
                print("Enter between 0 to 10 only.")
            except:
                print("Invalid input. Enter number 0-10.")

    # map anxiety -> scale
    t = anxiety / 10.0
    target_scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * t
    current_scale += (target_scale - current_scale) * 0.08

    # ---- SCALE CAMERA VIEW ----
    new_w = int(w * current_scale)
    new_h = int(h * current_scale)
    scaled = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

    if current_scale >= 1.0:
        # crop center
        x1 = (new_w - w) // 2
        y1 = (new_h - h) // 2
        output = scaled[y1:y1+h, x1:x1+w]
    else:
        # pad center
        output = np.zeros((h, w, 3), dtype=np.uint8)
        x = (w - new_w) // 2
        y = (h - new_h) // 2
        output[y:y+new_h, x:x+new_w] = scaled

    # ============================
    # FACE BOX + MOOD DETECTION
    # ============================
    gray = cv2.cvtColor(output, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 6)

    if len(faces) > 0:
        faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
        (fx, fy, fw, fh) = faces[0]

        cv2.rectangle(output, (fx, fy), (fx + fw, fy + fh), (0, 255, 0), 2)

        roi_gray = gray[fy:fy+fh, fx:fx+fw]
        mood, mood_color = detect_mood_lightweight(roi_gray, anxiety)

        cv2.putText(output, f"Mood: {mood}", (fx, fy - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, mood_color, 2)
    else:
        cv2.putText(output, "No face detected", (20, 210),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 2)

    # ---- UI TEXT ----
    remaining = int(CHECK_INTERVAL - (now - last_check_time))
    if remaining < 0:
        remaining = 0

    cv2.putText(output, f"Claustro Mode | Anxiety: {anxiety}/10", (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255,255,255), 2)

    cv2.putText(output, f"Next Check In: {remaining}s", (20, 85),
                cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255,255,255), 2)

    cv2.putText(output, f"Scale: {current_scale:.2f}", (20, 125),
                cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255,255,255), 2)

    if anxiety >= 7:
        cv2.putText(output, "Comfort Mode: EXPAND", (20, 170),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2)
    else:
        cv2.putText(output, "Exposure Mode: SHRINK", (20, 170),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2)

    cv2.imshow("Claustro Timer + Mood (Lightweight)", output)

    key = cv2.waitKey(1) & 0xFF
    if key == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
