using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Text;

public class UltravoxBotClient : MonoBehaviour
{
    public string apiKey;
    public string agentId;

    private const string BASE_URL = "https://api.ultravox.ai/api";

    [System.Serializable]
    public class UltravoxMessage
    {
        public string role;
        public string text;
    }

    [System.Serializable]
    public class CallCreateRequest
    {
        public UltravoxMessage[] initialMessages;
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.B))
        {
            Application.OpenURL("https://app.ultravox.ai/agents/3fc41d88-c1cc-4da1-b711-7ad29ff4868e/edit");
        }
    }

    public void StartCall(string userMsg)
    {
        StartCoroutine(CreateCall(userMsg));
    }

    IEnumerator CreateCall(string userMsg)
    {
        string url = $"{BASE_URL}/agents/{agentId}/calls";

        CallCreateRequest bodyObj = new CallCreateRequest
        {
            initialMessages = new UltravoxMessage[]
            {
                new UltravoxMessage { role = "MESSAGE_ROLE_USER", text = userMsg }
            }
        };

        string json = JsonUtility.ToJson(bodyObj);
        byte[] raw = Encoding.UTF8.GetBytes(json);

        UnityWebRequest req = new UnityWebRequest(url, "POST");
        req.uploadHandler = new UploadHandlerRaw(raw);
        req.downloadHandler = new DownloadHandlerBuffer();

        req.SetRequestHeader("Content-Type", "application/json");
        req.SetRequestHeader("X-API-Key", apiKey);

        yield return req.SendWebRequest();

        if (req.result == UnityWebRequest.Result.Success)
        {
            string response = req.downloadHandler.text;
            Debug.Log("✅ Ultravox Response: " + response);

            string joinUrl = ExtractJoinUrl(response);

            // ✅ NEW (minimum): if joinUrl not found, build browser URL from call id
            if (string.IsNullOrEmpty(joinUrl))
            {
                string callId = ExtractJsonValue(response, "id");
                if (string.IsNullOrEmpty(callId))
                    callId = ExtractJsonValue(response, "callId");

                if (!string.IsNullOrEmpty(callId))
                    joinUrl = "https://app.ultravox.ai/calls/" + callId;
            }

            if (!string.IsNullOrEmpty(joinUrl))
            {
                Debug.Log("🌐 JOIN URL => " + joinUrl);

                // ✅ copy in clipboard
                GUIUtility.systemCopyBuffer = joinUrl;

                if (!joinUrl.StartsWith("http"))
                {
                    Debug.LogError("❌ Not a browser URL: " + joinUrl);
                    yield break;
                }

                // ✅ open in browser
                Application.OpenURL(joinUrl);
            }
            else
            {
                Debug.LogError("❌ joinUrl not found!");
            }
        }
        else
        {
            Debug.LogError("Ultravox Error: " + req.error);
            Debug.LogError(req.downloadHandler.text);
        }
    }

    string ExtractJoinUrl(string json)
    {
        // ✅ try multiple possible keys
        string[] keys = { "\"joinUrl\":\"", "\"webUrl\":\"", "\"url\":\"", "\"callUrl\":\"", "\"join_url\":\"" };

        foreach (string key in keys)
        {
            int i = json.IndexOf(key);
            if (i >= 0)
            {
                int start = i + key.Length;
                int end = json.IndexOf("\"", start);
                if (end > start)
                {
                    string url = json.Substring(start, end - start).Replace("\\/", "/");
                    if (url.StartsWith("http")) return url;
                }
            }
        }

        // ✅ fallback: find first https link anywhere in JSON
        int httpsIndex = json.IndexOf("https://");
        if (httpsIndex >= 0)
        {
            int end = json.IndexOf("\"", httpsIndex);
            if (end > httpsIndex)
            {
                string url = json.Substring(httpsIndex, end - httpsIndex).Replace("\\/", "/");
                return url;
            }
        }

        return null;
    }

    // ✅ NEW (minimum): extract "id" / "callId"
    string ExtractJsonValue(string json, string key)
    {
        string pattern = "\"" + key + "\":\"";
        int i = json.IndexOf(pattern);
        if (i < 0) return null;

        int start = i + pattern.Length;
        int end = json.IndexOf("\"", start);
        if (end < 0) return null;

        return json.Substring(start, end - start);
    }
}
