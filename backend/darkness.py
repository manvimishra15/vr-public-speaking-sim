import cv2
import numpy as np
import time

# ---------- SETTINGS ----------
DARK_THRESHOLD = 60
BRIGHT_THRESHOLD = 160
CHECK_INTERVAL = 30  # ask anxiety every 30 sec

# ---------- FACE DETECTOR (LIGHTWEIGHT) ----------
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

# ---------- SUPPORT VALUES ----------
support_strength = 0.0   # 0.0..1.0 (how much we brighten)
support_target = 0.0

# ---------- INPUT ----------
def ask_anxiety(prompt="Enter anxiety (0-10): "):
    while True:
        try:
            x = int(input(prompt))
            if 0 <= x <= 10:
                return x
            print("Enter 0-10 only")
        except:
            print("Invalid input")

anxiety = ask_anxiety("Enter initial anxiety (0-10): ")
last_check = time.time()

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Camera not opening")
    exit()

print("\nRunning... Press Q to quit.\n")

def apply_gamma(image, gamma):
    # gamma < 1 => brighter, gamma > 1 => darker
    inv = 1.0 / gamma
    table = np.array([(i / 255.0) ** inv * 255 for i in range(256)]).astype("uint8")
    return cv2.LUT(image, table)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.resize(frame, (640, 480))

    # brightness check from original frame
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    brightness = float(np.mean(gray))

    # room status
    if brightness < DARK_THRESHOLD:
        room_status = "dark"
    elif brightness > BRIGHT_THRESHOLD:
        room_status = "too_bright"
    else:
        room_status = "ok"

    # ask anxiety every 30 sec
    now = time.time()
    if now - last_check >= CHECK_INTERVAL:
        last_check = now
        anxiety = ask_anxiety("Update anxiety (0-10): ")

    # ✅ MAIN SUPPORT LOGIC (REAL VISUAL EFFECT)
    # dark + high anxiety => strong bright exposure
    # dark + low anxiety  => reduce exposure gradually (dimming)
    if room_status == "dark":
        if anxiety >= 7:
            support_target = 1.0
        elif anxiety >= 4:
            support_target = 0.55
        else:
            support_target = 0.10
    else:
        if anxiety >= 7:
            support_target = 0.25
        elif anxiety >= 4:
            support_target = 0.10
        else:
            support_target = 0.0

    # smooth change
    support_strength += (support_target - support_strength) * 0.05
    support_strength = max(0.0, min(1.0, support_strength))

    # ✅ ACTUAL BRIGHTENING (Exposure boost)
    # gamma goes from 1.0 (normal) to 0.35 (very bright)
    gamma = 1.0 - (0.65 * support_strength)
    gamma = max(0.35, gamma)

    view = apply_gamma(frame, gamma)

    # ✅ Extra soft light overlay for “real brightness feel”
    overlay = np.full_like(view, 255)
    view = cv2.addWeighted(view, 1 - (0.25 * support_strength), overlay, (0.25 * support_strength), 0)

    # Face box (optional)
    faces = face_cascade.detectMultiScale(cv2.cvtColor(view, cv2.COLOR_BGR2GRAY), 1.1, 6)
    if len(faces) > 0:
        faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
        x, y, w, h = faces[0]
        cv2.rectangle(view, (x, y), (x+w, y+h), (0, 255, 0), 2)

    # UI text
    remaining = int(CHECK_INTERVAL - (now - last_check))
    if remaining < 0:
        remaining = 0

    cv2.putText(view, f"Room Brightness: {brightness:.1f}", (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)

    cv2.putText(view, f"Anxiety: {anxiety}/10", (20, 75),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)

    cv2.putText(view, f"Support: {support_strength:.2f} | Gamma: {gamma:.2f}", (20, 110),
                cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255,255,255), 2)

    cv2.putText(view, f"Next Anxiety Check: {remaining}s", (20, 145),
                cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255,255,255), 2)

    if room_status == "dark":
        cv2.putText(view, "Room is DARK (Exposure Boost Active)", (20, 185),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,0,255), 2)
    elif room_status == "too_bright":
        cv2.putText(view, "Room Too Bright (Dim lights)", (20, 185),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,255), 2)
    else:
        cv2.putText(view, "Room Light OK", (20, 185),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,255,0), 2)

    if room_status == "dark" and anxiety <= 3:
        cv2.putText(view, "Exposure Mode: Support Dimming Slowly...", (20, 230),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)

    if anxiety >= 7:
        cv2.putText(view, "Breathe IN... 4", (20, 280),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2)
        cv2.putText(view, "Breathe OUT... 4", (20, 320),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2)

    cv2.imshow("Darkness Mode (REAL Exposure Boost)", view)

    key = cv2.waitKey(1) & 0xFF
    if key == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
