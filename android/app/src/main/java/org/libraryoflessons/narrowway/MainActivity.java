package org.libraryoflessons.narrowway;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;
import java.io.ByteArrayInputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

public final class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/assets/game/index.html";
    private static final int IMPORT = 10, EXPORT = 11;
    private WebView game;
    private ValueCallback<Uri[]> fileSelection;
    private String pendingExport;

    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        game = new WebView(this);
        game.setBackgroundColor(Color.rgb(19, 37, 34));
        setContentView(game);
        fullscreen();
        WebSettings settings = game.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true); // Android's user-selected save documents.
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        game.addJavascriptInterface(new SaveBridge(), "NarrowWayAndroid");
        game.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                WebResourceResponse response = loader.shouldInterceptRequest(request.getUrl());
                return response != null ? response : new WebResourceResponse("text/plain", "UTF-8", 404, "Not found", null, new ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (START.equals(request.getUrl().toString())) return false;
                if (request.isForMainFrame()) openExternal(request.getUrl().toString());
                return true;
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (!START.equals(url)) return;
                view.evaluateJavascript("(()=>{"
                    + "document.getElementById('export').onclick=()=>NarrowWayAndroid.exportSave(JSON.stringify(Willowbrook.getState()),'narrow-way-journey.json');"
                    + "const b=[...document.querySelectorAll('button')].find(b=>b.textContent==='Export pre-decision save');"
                    + "if(b)b.onclick=()=>{const s=localStorage.getItem('narrow-way-before-final-choice');if(s)NarrowWayAndroid.exportSave(s,'narrow-way-before-decision.json');else alert('This save becomes available at the final decision.');};"
                    + "document.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&a.href.startsWith('https://')&&!a.href.startsWith(location.origin+'/')){e.preventDefault();NarrowWayAndroid.openLink(a.href);}},true);"
                    + "})()", null);
            }
        });
        game.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileSelection != null) fileSelection.onReceiveValue(null);
                fileSelection = callback;
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*");
                intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"application/json", "text/plain", "application/octet-stream"});
                try { startActivityForResult(intent, IMPORT); }
                catch (ActivityNotFoundException e) { fileSelection.onReceiveValue(null); fileSelection = null; message("No document picker is available."); }
                return true;
            }
        });
        game.loadUrl(START);
    }

    private final class SaveBridge {
        @JavascriptInterface public void exportSave(String json, String suggestedName) {
            if (json == null || json.length() > 100000) return;
            try { JSONObject save = new JSONObject(json); if (save.getInt("version") != 1) return; }
            catch (Exception e) { return; }
            runOnUiThread(() -> {
                if (pendingExport != null) return;
                pendingExport = json;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
                    .setType("application/json").putExtra(Intent.EXTRA_TITLE,
                        "narrow-way-before-decision.json".equals(suggestedName) ? suggestedName : "narrow-way-journey.json");
                try { startActivityForResult(intent, EXPORT); }
                catch (ActivityNotFoundException e) { pendingExport = null; message("No document picker is available."); }
            });
        }
        @JavascriptInterface public void openLink(String url) { runOnUiThread(() -> openExternal(url)); }
    }

    private void openExternal(String url) {
        Uri uri = Uri.parse(url);
        if (!"https".equals(uri.getScheme())) return;
        try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
        catch (ActivityNotFoundException e) { message("No browser is available to open this link."); }
    }

    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == IMPORT && fileSelection != null) {
            Uri uri = result == RESULT_OK && data != null ? data.getData() : null;
            fileSelection.onReceiveValue(uri == null ? null : new Uri[]{uri}); fileSelection = null;
        }
        if (request == EXPORT) {
            String json = pendingExport; pendingExport = null;
            if (result != RESULT_OK || data == null || data.getData() == null || json == null) return;
            try (OutputStream stream = getContentResolver().openOutputStream(data.getData())) {
                if (stream == null) throw new IllegalStateException("Unavailable destination");
                stream.write(json.getBytes(StandardCharsets.UTF_8)); message("Journey exported.");
            } catch (Exception e) { message("Could not export. Your in-app save is unchanged."); }
        }
    }

    private void message(String text) { Toast.makeText(this, text, Toast.LENGTH_LONG).show(); }
    private void fullscreen() {
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
    }
    @Override public void onWindowFocusChanged(boolean focused) { super.onWindowFocusChanged(focused); if (focused) fullscreen(); }
    @Override public void onBackPressed() {
        game.evaluateJavascript("window.Willowbrook?Willowbrook.getMode():'title'", mode -> {
            if ("\"play\"".equals(mode)) game.evaluateJavascript("document.getElementById('pause').click()", null);
            else new AlertDialog.Builder(this).setTitle("Leave the path?").setMessage("Your journey is saved when the app pauses.")
                .setNegativeButton("Keep playing", null).setPositiveButton("Close game", (d,w) -> finish()).show();
        });
    }
    @Override protected void onPause() {
        if (game != null) {
            game.evaluateJavascript("(()=>{if(window.Willowbrook&&Willowbrook.getMode()!=='title'){document.getElementById('save').click();if(Willowbrook.getMode()==='play')document.getElementById('pause').click();}if(window.Sound&&Sound.suspend)Sound.suspend();})()", null);
            game.onPause();
        }
        super.onPause();
    }
    @Override protected void onResume() {
        super.onResume();
        if (game != null) { game.onResume(); game.evaluateJavascript("if(window.Sound&&Sound.resume)Sound.resume()", null); }
    }
    @Override protected void onDestroy() {
        if (fileSelection != null) fileSelection.onReceiveValue(null);
        if (game != null) { game.removeJavascriptInterface("NarrowWayAndroid"); game.destroy(); }
        super.onDestroy();
    }
}
