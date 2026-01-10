using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

[Serializable]
public class AnxietyEntry
{
    public float timeSec;
    public int value; // 0-10
}

[Serializable]
public class SessionReport
{
    public string sessionId;
    public string levelName;
    public string startTimeISO;
    public string endTimeISO;
    public float durationSeconds;
    public List<AnxietyEntry> anxietyValues = new List<AnxietyEntry>();
}

public class SessionManager : MonoBehaviour
{
    public static SessionManager Instance;

    [Header("Session State")]
    public bool sessionRunning = false;
    public float elapsedTime = 0f;

    [Header("Report Data")]
    public SessionReport report;

    private void Awake()
    {
        Instance = this;
    }

    private void Update()
    {
        if (sessionRunning)
        {
            elapsedTime += Time.deltaTime;
        }
    }

    public void StartSession()
    {
        if (sessionRunning) return;

        elapsedTime = 0f;
        sessionRunning = true;

        report = new SessionReport();
        report.sessionId = DateTime.Now.ToString("yyyy-MM-dd_HH-mm-ss");
        report.levelName = UnityEngine.SceneManagement.SceneManager.GetActiveScene().name;
        report.startTimeISO = DateTime.Now.ToString("o");

        Debug.Log("✅ Session Started: " + report.sessionId);
    }

    public void EndSession()
    {
        if (!sessionRunning) return;

        sessionRunning = false;
        report.endTimeISO = DateTime.Now.ToString("o");
        report.durationSeconds = elapsedTime;

        Debug.Log("🛑 Session Ended. Duration: " + elapsedTime.ToString("F1") + " sec");

        SaveJSON();
        SaveCSV();
    }

    public void SubmitAnxiety(int value)
    {
        if (report == null) return;

        AnxietyEntry entry = new AnxietyEntry();
        entry.timeSec = elapsedTime;
        entry.value = Mathf.Clamp(value, 0, 10);

        report.anxietyValues.Add(entry);

        Debug.Log($"📌 Anxiety Logged: {entry.value} at {entry.timeSec:F1}s");
    }

    private void SaveJSON()
    {
        string dir = Path.Combine(Application.persistentDataPath, "SpeakSafeLogs");
        if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);

        string json = JsonUtility.ToJson(report, true);
        string path = Path.Combine(dir, report.sessionId + ".json");
        File.WriteAllText(path, json);

        Debug.Log("✅ JSON saved at: " + path);
    }

    private void SaveCSV()
    {
        string dir = Path.Combine(Application.persistentDataPath, "SpeakSafeLogs");
        if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);

        string path = Path.Combine(dir, report.sessionId + ".csv");

        using (StreamWriter sw = new StreamWriter(path))
        {
            sw.WriteLine("sessionId,timeSec,anxiety");
            foreach (var e in report.anxietyValues)
            {
                sw.WriteLine($"{report.sessionId},{e.timeSec:F1},{e.value}");
            }
        }

        Debug.Log("✅ CSV saved at: " + path);
    }
}
