import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import {
  IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent,
  IonHeader, IonInput, IonItem, IonTitle, IonToolbar, ToastController,
} from '@ionic/angular/standalone';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationService } from '../services/location';
import { FileSaverService } from '../services/file-saver';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonButton, IonItem, IonInput, NgIf, FormsModule,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {
  latitude = signal<number | null>(null);
  longitude = signal<number | null>(null);
  watchId: string | null = null;
  errorMsg = signal<string | null>(null);

  destino = signal('-0.229415,-78.524581');
  paradas = signal('-0.201452,-78.498124|-0.220164,-78.512328');

  urlUbicacion = computed(() => {
    const lat = this.latitude();
    const lng = this.longitude();
    if (lat === null || lng === null) return null;
    return `https://www.google.com/maps/@${lat},${lng},17z`;
  });

  urlRuta = computed(() => {
    const lat = this.latitude();
    const lng = this.longitude();
    const destino = this.limpiarCoord(this.destino());
    if (lat === null || lng === null || !destino) return null;

    let url = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${destino}`;
    const waypoints = this.paradas()
      .split('|')
      .map((p) => this.limpiarCoord(p))
      .filter((p) => p.length > 0);
    if (waypoints.length > 0) url += `&waypoints=${waypoints.join('%7C')}`;
    return url;
  });

  constructor(
    private loc: LocationService,
    private files: FileSaverService,
    private toastCtrl: ToastController,
  ) {}

  async ngOnInit() {
    await this.loc.ensurePermissions();
    await this.obtenerUbicacionActual();
    await this.iniciarSeguimiento();
  }

  async obtenerUbicacionActual() {
    try {
      const pos = await this.loc.getCurrentPosition();
      this.latitude.set(pos.coords.latitude);
      this.longitude.set(pos.coords.longitude);
      this.errorMsg.set(null);
    } catch (e: any) {
      this.errorMsg.set(e?.message ?? 'Error al obtener la ubicación actual');
    }
  }

  async iniciarSeguimiento() {
    try {
      this.watchId = await this.loc.watchPosition((pos) => {
        this.latitude.set(pos.coords.latitude);
        this.longitude.set(pos.coords.longitude);
        this.errorMsg.set(null);
      }, (err) => {
        this.errorMsg.set(err?.message ?? 'Error en seguimiento de ubicación');
      });
    } catch (e: any) {
      this.errorMsg.set(e?.message ?? 'No se pudo iniciar el seguimiento');
    }
  }

  async detenerSeguimiento() {
    if (this.watchId) {
      await this.loc.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  async guardarUbicacion() {
    const url = this.urlUbicacion();
    if (!url) return this.mostrarToast('Aún no hay ubicación disponible', 'warning');
    await this.guardar('ubicacion.txt', url);
  }

  async guardarRuta() {
    const url = this.urlRuta();
    if (!url) return this.mostrarToast('Falta la ubicación actual o el destino', 'warning');
    await this.guardar('ruta.txt', url);
  }

  private async guardar(nombre: string, url: string) {
    try {
      const fecha = new Date().toLocaleString();
      const destino = await this.files.guardarTxt(nombre, `${fecha} - ${url}`);
      await this.mostrarToast(`Guardado en ${destino}`, 'success');
    } catch (e: any) {
      await this.mostrarToast(e?.message ?? `No se pudo guardar ${nombre}`, 'danger');
    }
  }

  private limpiarCoord(valor: string): string {
    return valor.replace(/\s+/g, '');
  }

  private async mostrarToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, color, duration: 3000, position: 'bottom' });
    await toast.present();
  }

  ngOnDestroy() {
    if (this.watchId) this.loc.clearWatch(this.watchId);
  }
}