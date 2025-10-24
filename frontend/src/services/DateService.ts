export class DateService {
  /**
   * Ajusta la fecha incrementando el día en 1 y devuelve el resultado en formato ISO.
   * @param fecha - Fecha en formato string (YYYY-MM-DD).
   * @returns Fecha ajustada en formato ISO string.
   */
  static ajustarFecha(fecha: string | null): string {
    if (!fecha) {
        return '';
    }

    const [year, month, day] = fecha.split('-').map(Number);
    const adjustedDate = new Date(year, month - 1, day);
    adjustedDate.setDate(adjustedDate.getDate() + 1); // Incrementar el día

    const adjustedYear = adjustedDate.getFullYear();
    const adjustedMonth = String(adjustedDate.getMonth() + 1).padStart(2, '0');
    const adjustedDay = String(adjustedDate.getDate()).padStart(2, '0');
    return `${adjustedYear}-${adjustedMonth}-${adjustedDay}T00:00:00`;
  }
}