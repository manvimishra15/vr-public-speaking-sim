using UnityEngine;

public class RoomSwitcher : MonoBehaviour
{
    [Header("Stress Source")]
    public StressDetectorVR stressDetector;

    [Header("Rooms (0=Biggest/Easiest , 5=Smallest/Hardest)")]
    public GameObject[] rooms = new GameObject[6];

    [Header("Stress thresholds (stress HIGH => go BIGGER room)")]
    // >=80 -> Level0 (Biggest)
    // >=68 -> Level1
    // >=55 -> Level2
    // >=40 -> Level3
    // >=25 -> Level4
    // <25  -> Level5 (Smallest)
    public float[] enterStress = new float[5] { 80f, 68f, 55f, 40f, 25f };

    [Header("Smoothing")]
    public float switchCooldown = 1.5f;   // prevents rapid switching
    public float calmHoldTime = 6.0f;     // only shrink after calm for X sec

    [Header("Hysteresis (anti-flicker)")]
    public float hysteresis = 6f;         // buffer to stop bouncing

    private float lastSwitchTime = -999f;
    private float calmTimer = 0f;

    // Start from smallest room (hardest exposure)
    private int currentIndex = 5;

    void Start()
    {
        SetRoom(currentIndex); // start tiniest/smallest
    }

    void Update()
    {
        if (stressDetector == null) return;

        float s = stressDetector.stress;
        int target = GetTargetIndexWithHysteresis(s);

        // If target wants SMALLER room (harder exposure): require calm time
        // (smaller room => bigger index)
        if (target > currentIndex) calmTimer += Time.deltaTime;
        else calmTimer = 0f;

        // cooldown
        if (Time.time - lastSwitchTime < switchCooldown) return;
        if (target == currentIndex) return;

        // If stress increased => go BIGGER room immediately (easier)
        // bigger room => smaller index
        if (target < currentIndex)
        {
            SetRoom(target);
            lastSwitchTime = Time.time;
            calmTimer = 0f;
        }
        // If stress decreased and user stays calm => go SMALLER room (harder) slowly
        else if (target > currentIndex)
        {
            if (calmTimer >= calmHoldTime)
            {
                SetRoom(target);
                lastSwitchTime = Time.time;
                calmTimer = 0f;
            }
        }
    }

    // Basic mapping: stress HIGH -> Level0(big) ... stress LOW -> Level5(small)
    int GetTargetIndex(float stress)
    {
        if (stress >= enterStress[0]) return 0;
        if (stress >= enterStress[1]) return 1;
        if (stress >= enterStress[2]) return 2;
        if (stress >= enterStress[3]) return 3;
        if (stress >= enterStress[4]) return 4;
        return 5;
    }

    // Hysteresis to prevent flicker:
    // only change level when stress crosses threshold ± buffer
    int GetTargetIndexWithHysteresis(float stress)
    {
        int desired = GetTargetIndex(stress);

        // If it wants to move to bigger room (easier / smaller index):
        // require stress to be comfortably above threshold
        if (desired < currentIndex)
        {
            // Example: going from 4 -> 3 means we crossed enterStress[3]
            // To avoid flicker we demand extra buffer:
            float threshold = ThresholdForIndex(desired);
            if (stress < threshold + hysteresis) return currentIndex;
        }

        // If it wants to move to smaller room (harder / bigger index):
        // require stress to be comfortably below threshold
        if (desired > currentIndex)
        {
            float threshold = ThresholdForIndex(currentIndex - 1); // threshold that would pull it back bigger
            if (stress > threshold - hysteresis) return currentIndex;
        }

        return desired;
    }

    // Helper: which threshold corresponds to switching into that index?
    // Index 0 uses enterStress[0], 1 uses enterStress[1], ..., 4 uses enterStress[4], 5 uses none
    float ThresholdForIndex(int index)
    {
        if (index <= 0) return enterStress[0];
        if (index == 1) return enterStress[1];
        if (index == 2) return enterStress[2];
        if (index == 3) return enterStress[3];
        if (index == 4) return enterStress[4];
        return 0f;
    }

    void SetRoom(int index)
    {
        for (int i = 0; i < rooms.Length; i++)
        {
            if (rooms[i] != null)
                rooms[i].SetActive(i == index);
        }
        currentIndex = index;

        Debug.Log($"Room switched to Level {currentIndex} (0=Biggest, 5=Smallest)");
    }

    public int GetCurrentRoomIndex()
    {
        return currentIndex;
    }
}

