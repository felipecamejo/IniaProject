export class DateService {
  /**
   * Normaliza la fecha recibida (YYYY-MM-DD) a inicio de día sin desplazarla.
   * @param fecha - Fecha en formato string (YYYY-MM-DD).
   * @returns Fecha en formato ISO local sin zona (YYYY-MM-DDT00:00:00).
   */
  static ajustarFecha(fecha: string | null): string {
    if (!fecha) {
        return '';
    }

    const [year, month, day] = fecha.split('-').map(Number);
    const adjustedDate = new Date(year, month - 1, day);

    const adjustedYear = adjustedDate.getFullYear();
    const adjustedMonth = String(adjustedDate.getMonth() + 1).padStart(2, '0');
    const adjustedDay = String(adjustedDate.getDate()).padStart(2, '0');
    return `${adjustedYear}-${adjustedMonth}-${adjustedDay}T00:00:00`;
  }
}