export const parseEventDateTime = (dateStr, timeStr) => {
  if (!dateStr) return null;
  try {
    let year, month, day;

    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [y, m, d] = dateStr.split('T')[0].split('-').map(Number);
      year = y;
      month = m - 1;
      day = d;
    } else {
      const cleanStr = dateStr.replace(/Tháng\s*/i, '').replace(',', '');
      const parts = cleanStr.split(/\s+/);
      if (parts.length >= 3) {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      } else {
        return null;
      }
    }

    let hours = 0;
    let minutes = 0;

    if (timeStr && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]/.test(timeStr)) {
      const [h, m] = timeStr.split(':').map(Number);
      hours = h;
      minutes = m;
    }

    // Format ISO string với múi giờ Việt Nam +07:00
    const pad = (num) => String(num).padStart(2, '0');
    const isoStr = `${year}-${pad(month + 1)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00+07:00`;
    return new Date(isoStr);
  } catch (e) {
    console.error('Error in parseEventDateTime:', e);
    return null;
  }
};

export const isSalesClosed = (dateStr, timeStr) => {
  const eventStart = parseEventDateTime(dateStr, timeStr);
  if (!eventStart) return false;
  const now = new Date();
  const salesClose = new Date(eventStart.getTime() - 60 * 60 * 1000); // 1 tiếng trước giờ bắt đầu
  return now > salesClose;
};

export const isEventStarted = (dateStr, timeStr) => {
  const eventStart = parseEventDateTime(dateStr, timeStr);
  if (!eventStart) return false;
  const now = new Date();
  return now >= eventStart;
};
