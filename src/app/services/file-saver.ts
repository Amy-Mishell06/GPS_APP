import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';

@Injectable({ providedIn: 'root' })
export class FileSaverService {
  /**
   * Guarda una línea de texto en un archivo .txt.
   * - En el celular: carpeta Documents (agrega al final, queda como historial).
   * - En el navegador: descarga el archivo .txt.
   */
  async guardarTxt(nombreArchivo: string, contenido: string): Promise<string> {
    const linea = `${contenido}\n`;

    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.appendFile({
          path: nombreArchivo,
          data: linea,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
      } catch {
        // El archivo aún no existe: se crea
        await Filesystem.writeFile({
          path: nombreArchivo,
          data: linea,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
          recursive: true,
        });
      }
      const { uri } = await Filesystem.getUri({ path: nombreArchivo, directory: Directory.Documents });
      return uri;
    }

    // Navegador: descarga del archivo
    const blob = new Blob([linea], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return `Descargas/${nombreArchivo}`;
  }
}