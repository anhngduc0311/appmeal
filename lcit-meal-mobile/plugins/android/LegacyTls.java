package __PACKAGE__;

import android.content.Context;
import android.os.Build;
import android.util.Log;
import com.facebook.react.modules.network.OkHttpClientProvider;
import java.io.InputStream;
import java.security.KeyStore;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;

/** Adds public ISRG roots on Android 6, which has no Network Security Config. */
public final class LegacyTls {
  private LegacyTls() {}

  public static void install(Context context) {
    if (Build.VERSION.SDK_INT != 23) return;
    try {
      KeyStore roots = KeyStore.getInstance(KeyStore.getDefaultType());
      roots.load(null, null);
      CertificateFactory certificates = CertificateFactory.getInstance("X.509");
      int[] resources = {R.raw.isrgrootx1, R.raw.isrgrootx2};
      for (int resource : resources) {
        try (InputStream input = context.getResources().openRawResource(resource)) {
          roots.setCertificateEntry(Integer.toString(resource), certificates.generateCertificate(input));
        }
      }
      final X509TrustManager system = trustManager(null);
      final X509TrustManager bundled = trustManager(roots);
      final X509TrustManager combined = new X509TrustManager() {
        @Override
        public void checkClientTrusted(X509Certificate[] chain, String authType) throws CertificateException {
          system.checkClientTrusted(chain, authType);
        }

        @Override
        public void checkServerTrusted(X509Certificate[] chain, String authType) throws CertificateException {
          try {
            system.checkServerTrusted(chain, authType);
          } catch (CertificateException systemError) {
            // This still validates signatures and expiry against public roots.
            bundled.checkServerTrusted(chain, authType);
          }
        }

        @Override
        public X509Certificate[] getAcceptedIssuers() {
          X509Certificate[] first = system.getAcceptedIssuers();
          X509Certificate[] second = bundled.getAcceptedIssuers();
          X509Certificate[] all = new X509Certificate[first.length + second.length];
          System.arraycopy(first, 0, all, 0, first.length);
          System.arraycopy(second, 0, all, first.length, second.length);
          return all;
        }
      };
      final SSLContext tls = SSLContext.getInstance("TLS");
      tls.init(null, new TrustManager[] {combined}, null);
      // Preserve RN's cookie jar and OkHttp's default hostname verification.
      OkHttpClientProvider.setOkHttpClientFactory(() ->
          OkHttpClientProvider.createClientBuilder(context.getApplicationContext())
              .sslSocketFactory(tls.getSocketFactory(), combined)
              .build());
    } catch (Exception error) {
      // Keep system verification if setup fails; never use a trust-all client.
      Log.e("LegacyTls", "Could not load bundled public CA roots", error);
    }
  }

  private static X509TrustManager trustManager(KeyStore roots) throws Exception {
    TrustManagerFactory factory = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
    factory.init(roots);
    for (TrustManager manager : factory.getTrustManagers()) {
      if (manager instanceof X509TrustManager) return (X509TrustManager) manager;
    }
    throw new IllegalStateException("No X509TrustManager available");
  }
}
