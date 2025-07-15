interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

class SecureCookieManager {
  private static getSecureDefaults(): CookieOptions {
    return {
      secure: window.location.protocol === 'https:',
      sameSite: 'strict',
      path: '/',
      httpOnly: false // Can't set httpOnly from client-side JS
    };
  }

  static setCookie(name: string, value: string, options: CookieOptions = {}) {
    const secureOptions = { ...this.getSecureDefaults(), ...options };
    
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    if (secureOptions.expires) {
      cookieString += `; expires=${secureOptions.expires.toUTCString()}`;
    }
    
    if (secureOptions.maxAge) {
      cookieString += `; max-age=${secureOptions.maxAge}`;
    }
    
    if (secureOptions.domain) {
      cookieString += `; domain=${secureOptions.domain}`;
    }
    
    if (secureOptions.path) {
      cookieString += `; path=${secureOptions.path}`;
    }
    
    if (secureOptions.secure) {
      cookieString += '; secure';
    }
    
    if (secureOptions.sameSite) {
      cookieString += `; samesite=${secureOptions.sameSite}`;
    }
    
    document.cookie = cookieString;
  }

  static getCookie(name: string): string | null {
    const nameEq = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEq) === 0) {
        return decodeURIComponent(cookie.substring(nameEq.length));
      }
    }
    
    return null;
  }

  static deleteCookie(name: string, options: Partial<CookieOptions> = {}) {
    this.setCookie(name, '', {
      ...options,
      expires: new Date(0)
    });
  }

  static setSecurePreference(key: string, value: string) {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1); // 1 year expiry
    
    this.setCookie(`pref_${key}`, value, {
      expires,
      secure: true,
      sameSite: 'strict'
    });
  }

  static getSecurePreference(key: string): string | null {
    return this.getCookie(`pref_${key}`);
  }

  static clearAllPreferences() {
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      const [name] = cookie.trim().split('=');
      if (name.startsWith('pref_')) {
        this.deleteCookie(decodeURIComponent(name));
      }
    }
  }
}

export default SecureCookieManager;