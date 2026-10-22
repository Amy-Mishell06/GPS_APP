import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Geolocation, PermissionStatus, Position } from '@capacitor/geolocation';

@Injectable({ providedIn: 'root' })
export class LocationService {
  async ensurePermissions(): Promise<PermissionStatus | null> {
    if (!Capacitor.isNativePlatform()) return null;
    const perm = await Geolocation.checkPermissions();
    if (perm.location === 'granted' || perm.coarseLocation === 'granted') return perm;
    return Geolocation.requestPermissions();
  }

  async getCurrentPosition(): Promise<Position> {
    try {
      return await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });
    } catch (e: any) {
      if (e?.code === 1 || /denied|permission/i.test(e?.message ?? '')) throw e;
      return Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 60000,
      });
    }
  }

  async watchPosition(onPos: (p: Position) => void, onErr?: (e: any) => void): Promise<string> {
    const id = await Geolocation.watchPosition(
      {
        enableHighAccuracy: Capacitor.isNativePlatform(),
        timeout: 30000,
        maximumAge: 10000,
      },
      (pos, err) => {
        if (pos) onPos(pos);
        else if (err && onErr) onErr(err);
      }
    );
    return id as unknown as string;
  }

  async clearWatch(id: string): Promise<void> {
    await Geolocation.clearWatch({ id });
  }
}