import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  LayoutDashboard, Calendar, Ticket, User, Users, PlusCircle, Trash2,
  Edit, Check, X, RefreshCw, BarChart2, DollarSign, Package, Activity,
  ArrowLeft, MapPin, Tag, Armchair, ChevronRight, Save, ShieldAlert, Key,
  CheckSquare, UserPlus, Sun, Moon, Mic, Monitor
} from 'lucide-react';

function CustomSelect({ label, value, onChange, options, placeholder = '-- Chọn --', small = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setIsOpen(prev => !prev);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="admin-custom-select-container" ref={triggerRef}>
      {label && (
        <label
          className="admin-form-label"
          style={small ? { fontSize: '11px', marginBottom: '8px' } : {}}
        >
          {label}
        </label>
      )}
      <div
        className={`admin-custom-select-trigger ${isOpen ? 'active' : ''}`}
        style={small ? { padding: '8px 12px', minHeight: '38px', fontSize: '13.5px' } : {}}
        onClick={handleOpen}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <svg
          className={`select-arrow-icon ${isOpen ? 'open' : ''}`}
          width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {isOpen && createPortal(
        <ul
          className="admin-custom-select-options"
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 99999,
            margin: 0,
          }}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`admin-custom-select-option ${value === opt.value ? 'selected' : ''}`}
              style={small ? { padding: '8px 12px', fontSize: '13.5px' } : {}}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  );
}

function CustomDatePicker({ label, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const parsedDate = (() => {
    if (!value) return null;
    try {
      const cleanStr = value.replace(/Tháng\s*/i, '');
      const parts = cleanStr.split(/\s+/);
      if (parts.length < 3) return null;
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1].replace(',', ''), 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return isNaN(d.getTime()) ? null : d;
    } catch (e) {
      return null;
    }
  })();

  const today = new Date();
  const [viewMonth, setViewMonth] = useState(parsedDate ? parsedDate.getMonth() : today.getMonth());
  const [viewYear, setViewYear] = useState(parsedDate ? parsedDate.getFullYear() : today.getFullYear());

  useEffect(() => {
    if (parsedDate) {
      setViewMonth(parsedDate.getMonth());
      setViewYear(parsedDate.getFullYear());
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  const getDaysInMonth = (month, year) => {
    const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return days[month];
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day) => {
    const formattedDate = `${day} Tháng ${viewMonth + 1}, ${viewYear}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(viewMonth, viewYear);
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const emptyCells = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <div className="admin-custom-picker-container" ref={containerRef}>
      {label && <label className="admin-form-label">{label}</label>}
      <div 
        className={`admin-custom-select-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || 'Chọn ngày diễn ra...'}</span>
        <svg 
          className="select-arrow-icon"
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
      </div>

      {isOpen && (
        <div className="admin-custom-datepicker-dropdown">
          <div className="datepicker-header">
            <button type="button" className="datepicker-nav-btn" onClick={handlePrevMonth}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <span className="datepicker-month-year">
              Tháng {viewMonth + 1}, {viewYear}
            </span>
            <button type="button" className="datepicker-nav-btn" onClick={handleNextMonth}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className="datepicker-weekdays">
            {weekDays.map(wd => (
              <span key={wd} className="datepicker-weekday">{wd}</span>
            ))}
          </div>

          <div className="datepicker-days-grid">
            {Array.from({ length: emptyCells }).map((_, idx) => (
              <span key={`empty-${idx}`} className="datepicker-day empty"></span>
            ))}
            {daysArray.map(day => {
              const isSelected = parsedDate && 
                parsedDate.getDate() === day && 
                parsedDate.getMonth() === viewMonth && 
                parsedDate.getFullYear() === viewYear;
              const isCurrentDay = today.getDate() === day && 
                today.getMonth() === viewMonth && 
                today.getFullYear() === viewYear;
              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  className={`datepicker-day-btn ${isSelected ? 'selected' : ''} ${isCurrentDay ? 'today' : ''}`}
                  onClick={() => handleSelectDay(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomTimePicker({ label, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const hourPart = value ? value.split(':')[0] : '19';
  const minutePart = value ? value.split(':')[1] : '30';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectHour = (h) => {
    const newTime = `${String(h).padStart(2, '0')}:${minutePart}`;
    onChange(newTime);
  };

  const handleSelectMinute = (m) => {
    const newTime = `${hourPart}:${String(m).padStart(2, '0')}`;
    onChange(newTime);
  };

  const hoursList = Array.from({ length: 24 }, (_, i) => i);
  const minutesList = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="admin-custom-picker-container" ref={containerRef}>
      {label && <label className="admin-form-label">{label}</label>}
      <div 
        className={`admin-custom-select-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || 'Chọn giờ diễn ra...'}</span>
        <svg 
          className="select-arrow-icon"
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>

      {isOpen && (
        <div className="admin-custom-timepicker-dropdown">
          <div className="timepicker-columns">
            <div className="timepicker-column">
              <div className="timepicker-column-header">Giờ</div>
              <div className="timepicker-column-list">
                {hoursList.map(h => {
                  const hStr = String(h).padStart(2, '0');
                  const isSelected = hStr === hourPart;
                  return (
                    <button
                      key={`hour-${h}`}
                      type="button"
                      className={`timepicker-item-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectHour(h)}
                    >
                      {hStr}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="timepicker-column">
              <div className="timepicker-column-header">Phút</div>
              <div className="timepicker-column-list">
                {minutesList.map(m => {
                  const mStr = String(m).padStart(2, '0');
                  const isSelected = mStr === minutePart;
                  return (
                    <button
                      key={`minute-${m}`}
                      type="button"
                      className={`timepicker-item-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectMinute(m)}
                    >
                      {mStr}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="timepicker-footer">
            <button 
              type="button" 
              className="timepicker-confirm-btn"
              onClick={() => setIsOpen(false)}
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

const rgbToHex = (rgbString) => {
  if (!rgbString) return '#8b5cf6';
  const parts = rgbString.split(',').map(p => parseInt(p.trim(), 10));
  if (parts.length !== 3 || parts.some(isNaN)) return '#8b5cf6';
  const r = Math.max(0, Math.min(255, parts[0]));
  const g = Math.max(0, Math.min(255, parts[1]));
  const b = Math.max(0, Math.min(255, parts[2]));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (e) {
    return dateStr;
  }
};

export default function AdminDashboard({ 
  events: initialEvents, 
  tickets: initialTickets, 
  onUpdateEvents,
  onUpdateTickets,
  theme,
  setTheme
}) {
  const [activeTab, setActiveTab] = useState('analytics');
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [creators, setCreators] = useState([]);
  const [users, setUsers] = useState([]);
  const [popup, setPopup] = useState(null);

  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [userSort, setUserSort] = useState('username-asc');
  const [userPage, setUserPage] = useState(1);
  const [userLimit, setUserLimit] = useState(5);

  const [changePasswordUserId, setChangePasswordUserId] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('client');
  const [selectedCreatorId, setSelectedCreatorId] = useState('');

  const showAlert = (message, title = 'Thông báo') => {
    return new Promise((resolve) => {
      setPopup({
        title,
        message,
        type: 'alert',
        onConfirm: () => {
          setPopup(null);
          resolve(true);
        }
      });
    });
  };

  const showConfirm = (message, title = 'Xác nhận') => {
    return new Promise((resolve) => {
      setPopup({
        title,
        message,
        type: 'confirm',
        onConfirm: () => {
          setPopup(null);
          resolve(true);
        },
        onCancel: () => {
          setPopup(null);
          resolve(false);
        }
      });
    });
  };

  const [editingEventId, setEditingEventId] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState('music');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventPriceRange, setEventPriceRange] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventBadge, setEventBadge] = useState('');
  const [eventCreatorId, setEventCreatorId] = useState('');
  const [eventTheme, setEventTheme] = useState('dark');
  const [eventIsFeatured, setEventIsFeatured] = useState(false);
  const [eventIsTrending, setEventIsTrending] = useState(false);
  const [eventEventType, setEventEventType] = useState('live');
  const [eventOnlineLink, setEventOnlineLink] = useState('');
  const [eventPlatform, setEventPlatform] = useState('');
  const [eventOnlinePassword, setEventOnlinePassword] = useState('');
  const [eventOnlineInstructions, setEventOnlineInstructions] = useState('');
  const [eventOnlinePrice, setEventOnlinePrice] = useState(0);
  const [eventOnlineCapacity, setEventOnlineCapacity] = useState(100);

  const [eventZones, setEventZones] = useState([]);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZonePrice, setNewZonePrice] = useState('');
  const [newZoneIsStanding, setNewZoneIsStanding] = useState(false);
  const [newZoneCapacity, setNewZoneCapacity] = useState('');
  const [newZoneRows, setNewZoneRows] = useState('');
  const [newZoneCols, setNewZoneCols] = useState('');

  const handleAdminEventTypeChange = (val) => {
    setEventEventType(val);
    setNewZoneName('');
    setNewZonePrice('');
    if (val === 'workshop') {
      setEventZones([
        { id: `zone-t1-${Date.now()}`, name: 'Bàn 1', price: 300000, isStanding: false, availableTickets: 6, rows: null, cols: null },
        { id: `zone-t2-${Date.now()}`, name: 'Bàn 2', price: 300000, isStanding: false, availableTickets: 6, rows: null, cols: null },
      ]);
      setNewZoneCapacity('6');
    } else if (val === 'live') {
      setEventZones([]);
      setNewZoneCapacity('');
    }
  };

  const [editingCreatorId, setEditingCreatorId] = useState(null);
  const [creatorName, setCreatorName] = useState('');
  const [creatorType, setCreatorType] = useState('Ca Sĩ');
  const [creatorFilterType, setCreatorFilterType] = useState('Nghệ Sĩ');
  const [creatorLogo, setCreatorLogo] = useState('');
  const [creatorIcon, setCreatorIcon] = useState('mic');
  const [creatorRating, setCreatorRating] = useState('5.0');
  const [creatorFollowers, setCreatorFollowers] = useState('');
  const [creatorEventCount, setCreatorEventCount] = useState('');
  const [creatorLocation, setCreatorLocation] = useState('');
  const [creatorDescription, setCreatorDescription] = useState('');
  const [creatorAccentColor, setCreatorAccentColor] = useState('139, 92, 246');
  const [creatorStats, setCreatorStats] = useState('');

  const [eventSearch, setEventSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [eventSort, setEventSort] = useState('name-asc');
  const [eventPage, setEventPage] = useState(1);
  const [eventLimit, setEventLimit] = useState(5);

  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingSort, setBookingSort] = useState('date-desc');
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingLimit, setBookingLimit] = useState(5);

  const [resaleSearch, setResaleSearch] = useState('');
  const [resaleFilter, setResaleFilter] = useState('all');
  const [resaleSort, setResaleSort] = useState('discount-desc');
  const [resalePage, setResalePage] = useState(1);
  const [resaleLimit, setResaleLimit] = useState(5);

  const [creatorSearch, setCreatorSearch] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [creatorSort, setCreatorSort] = useState('name-asc');
  const [creatorPage, setCreatorPage] = useState(1);
  const [creatorLimit, setCreatorLimit] = useState(5);
  const [expiryMinutes, setExpiryMinutes] = useState(30);
  const [expiryLoading, setExpiryLoading] = useState(false);
  
  // Loading states
  const [loadingEventAction, setLoadingEventAction] = useState(null); // null, or eventId
  const [loadingSaveEvent, setLoadingSaveEvent] = useState(false);
  const [loadingImageUpload, setLoadingImageUpload] = useState(false);
  const [loadingCreatorAction, setLoadingCreatorAction] = useState(null);
  const [loadingSaveCreator, setLoadingSaveCreator] = useState(false);
  const [loadingUserAction, setLoadingUserAction] = useState(null);
  const [loadingSaveUser, setLoadingSaveUser] = useState(false);
  const [loadingChangePassword, setLoadingChangePassword] = useState(false);
  const [loadingBookingAction, setLoadingBookingAction] = useState(null);
  const [loadingResaleAction, setLoadingResaleAction] = useState(null);

  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + b.totalPrice, 0);
  
  const totalTicketsSold = bookings
    .filter(b => b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + b.count, 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getElapsedMinutes = (createdAt) =>
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);

  const fetchAllData = async () => {
    try {
      const [eventsRes, bookingsRes, ticketsRes, creatorsRes, usersRes] = await Promise.all([
        fetch('http://localhost:5000/api/events?status=all'),
        fetch('http://localhost:5000/api/admin/bookings'),
        fetch('http://localhost:5000/api/admin/resale'),
        fetch('http://localhost:5000/api/creators'),
        fetch('http://localhost:5000/api/admin/users')
      ]);

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
        if (onUpdateEvents) onUpdateEvents(eventsData);
      }
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }
      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setTickets(ticketsData);
        if (onUpdateTickets) onUpdateTickets(ticketsData);
      }
      if (creatorsRes.ok) {
        const creatorsData = await creatorsRes.json();
        setCreators(creatorsData);
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    setEventPage(1);
  }, [eventSearch, eventFilter, eventSort, eventLimit]);

  useEffect(() => {
    setBookingPage(1);
  }, [bookingSearch, bookingFilter, bookingSort, bookingLimit]);

  useEffect(() => {
    setResalePage(1);
  }, [resaleSearch, resaleFilter, resaleSort, resaleLimit]);

  useEffect(() => {
    setCreatorPage(1);
  }, [creatorSearch, creatorFilter, creatorSort, creatorLimit]);

  useEffect(() => {
    setUserPage(1);
  }, [userSearch, userFilter, userSort, userLimit]);

  const handleToggleUserRole = async (userId) => {
    const isConfirmed = await showConfirm("Bạn có chắc chắn muốn thay đổi vai trò của tài khoản này?");
    if (isConfirmed) {
      setLoadingUserAction(userId);
      try {
        const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
          method: 'PUT'
        });
        if (!res.ok) {
          const err = await res.json();
          await showAlert(err.error || 'Cập nhật vai trò thất bại');
          return;
        }
        await fetchAllData();
      } catch (err) {
        console.error(err);
        await showAlert('Lỗi kết nối API cập nhật vai trò');
      } finally {
        setLoadingUserAction(null);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    const isConfirmed = await showConfirm("Bạn có chắc chắn muốn xóa tài khoản này? Việc này sẽ xóa toàn bộ vé (tickets) và đơn đặt hàng (bookings) liên quan.");
    if (isConfirmed) {
      setLoadingUserAction(userId);
      try {
        const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          const err = await res.json();
          await showAlert(err.error || 'Xóa tài khoản thất bại');
          return;
        }
        await fetchAllData();
      } catch (err) {
        console.error(err);
        await showAlert('Lỗi kết nối API xóa tài khoản');
      } finally {
        setLoadingUserAction(null);
      }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUsername || !newPassword || !newEmail) {
      await showAlert('Vui lòng điền các trường bắt buộc');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      await showAlert('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoadingSaveUser(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          email: newEmail,
          fullName: newFullName,
          phone: newPhone,
          role: newRole,
          creatorId: newRole === 'organizer' ? selectedCreatorId : ''
        })
      });
      if (!res.ok) {
        const err = await res.json();
        await showAlert(err.error || 'Cập tài khoản thất bại');
        return;
      }
      await showAlert('Cấp tài khoản người dùng thành công!');
      setShowCreateUserModal(false);
      setNewUsername('');
      setNewPassword('');
      setConfirmNewPassword('');
      setNewEmail('');
      setNewFullName('');
      setNewPhone('');
      setNewRole('client');
      setSelectedCreatorId('');
      await fetchAllData();
    } catch (err) {
      console.error(err);
      await showAlert('Lỗi kết nối API cấp tài khoản');
    } finally {
      setLoadingSaveUser(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPasswordInput) {
      await showAlert('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      await showAlert('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoadingChangePassword(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${changePasswordUserId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPasswordInput })
      });
      if (!res.ok) {
        const err = await res.json();
        await showAlert(err.error || 'Đổi mật khẩu thất bại');
        return;
      }
      await showAlert('Đổi mật khẩu người dùng thành công!');
      setChangePasswordUserId(null);
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      await fetchAllData();
    } catch (err) {
      console.error(err);
      await showAlert('Lỗi kết nối API đổi mật khẩu');
    } finally {
      setLoadingChangePassword(false);
    }
  };

  const handleImageUpload = async (e, setImageUrl) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoadingImageUpload(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:5000/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const err = await res.json();
        await showAlert(err.error || 'Upload ảnh thất bại');
        return;
      }
      const data = await res.json();
      setImageUrl(data.url);
    } catch (err) {
      console.error(err);
      await showAlert('Lỗi kết nối API upload ảnh');
    } finally {
      setLoadingImageUpload(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const term = userSearch.toLowerCase().trim();
    const matchSearch = !term ||
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.fullName && u.fullName.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.phone && u.phone.toLowerCase().includes(term));
    const matchFilter = userFilter === 'all' || u.role === userFilter;
    return matchSearch && matchFilter;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (userSort === 'username-asc') return (a.username || '').localeCompare(b.username || '');
    if (userSort === 'username-desc') return (b.username || '').localeCompare(a.username || '');
    if (userSort === 'email-asc') return (a.email || '').localeCompare(b.email || '');
    return 0;
  });

  const totalUserPages = Math.max(1, Math.ceil(sortedUsers.length / userLimit));
  const paginatedUsers = sortedUsers.slice((userPage - 1) * userLimit, userPage * userLimit);

  const handleEditEventClick = (event) => {
    setEditingEventId(event.id);
    setEventTitle(event.title);
    setEventCategory(event.category || 'music');
    setEventDate(event.date);
    setEventTime(event.time || '19:30');
    setEventLocation(event.location);
    setEventPriceRange(event.priceRange);
    setEventImage(event.image);
    setEventDescription(event.description || '');
    setEventBadge(event.badge || '');
    setEventZones(event.zones || []);
    setEventCreatorId(event.creatorId || '');
    setEventTheme(event.theme || 'dark');
    setEventIsFeatured(!!event.isFeatured);
    setEventIsTrending(!!event.isTrending);
    setEventEventType(event.eventType || 'live');
    setEventOnlineLink(event.onlineLink || '');
    setEventPlatform(event.platform || '');
    setEventOnlinePassword(event.onlinePassword || '');
    setEventOnlineInstructions(event.onlineInstructions || '');
    if (event.eventType === 'online' && event.zones?.[0]) {
      setEventOnlinePrice(event.zones[0].price || 0);
      setEventOnlineCapacity(event.zones[0].availableTickets || 100);
    }
  };

  const handleCreateNewEventClick = () => {
    setEditingEventId('new');
    setEventTitle('');
    setEventCategory('music');
    setEventDate('18 Tháng 11, 2026');
    setEventTime('19:30');
    setEventLocation('Sân vận động Quân khu 7, TP.HCM');
    setEventPriceRange('500.000đ - 3.000.000đ');
    setEventImage('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80');
    setEventDescription('');
    setEventBadge('Hot Show');
    setEventCreatorId('');
    setEventTheme('dark');
    setEventIsFeatured(true);
    setEventIsTrending(true);
    setEventEventType('live');
    setEventOnlineLink('');
    setEventPlatform('');
    setEventOnlinePassword('');
    setEventOnlineInstructions('');
    setEventOnlinePrice(0);
    setEventOnlineCapacity(100);
    setEventZones([
      { id: `zone-vip-${Date.now()}`, name: 'Khu VIP Lầu 1', price: 3000000, isStanding: false, availableTickets: 10, rows: 2, cols: 5 },
      { id: `zone-ga-${Date.now()}`, name: 'Khu Đứng GA', price: 500000, isStanding: true, availableTickets: 300, rows: null, cols: null }
    ]);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle || !eventLocation || !eventPriceRange) {
      await showAlert("Vui lòng điền các trường bắt buộc.");
      return;
    }

    const payload = {
      title: eventTitle,
      category: eventCategory,
      date: eventDate,
      time: eventTime,
      location: eventLocation,
      priceRange: eventPriceRange,
      image: eventImage,
      description: eventDescription,
      badge: eventBadge,
      theme: eventTheme,
      isFeatured: eventIsFeatured,
      isTrending: eventIsTrending,
      zones: eventEventType === 'online'
        ? [{ id: `zone-online-${Date.now()}`, name: 'Vé tham dự trực tuyến', price: Number(eventOnlinePrice) || 0, isStanding: true, availableTickets: Number(eventOnlineCapacity) || 100, rows: null, cols: null }]
        : eventZones,
      creatorId: eventCreatorId || null,
      eventType: eventEventType,
      onlineLink: eventEventType === 'online' ? eventOnlineLink : null,
      platform: eventEventType === 'online' ? eventPlatform : null,
      onlinePassword: eventEventType === 'online' ? eventOnlinePassword : null,
      onlineInstructions: eventEventType === 'online' ? eventOnlineInstructions : null
    };

    setLoadingSaveEvent(true);
    try {
      let res;
      if (editingEventId === 'new') {
        res = await fetch('http://localhost:5000/api/admin/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`http://localhost:5000/api/admin/events/${editingEventId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const err = await res.json();
        await showAlert(err.error || 'Lưu sự kiện thất bại');
        return;
      }

      await fetchAllData();
      setEditingEventId(null);
    } catch (err) {
      console.error(err);
      await showAlert('Lỗi kết nối API lưu sự kiện');
    } finally {
      setLoadingSaveEvent(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    const isConfirmed = await showConfirm("Bạn có chắc chắn muốn xóa sự kiện này? Thao tác này sẽ xóa tất cả các phân khu và đơn đặt vé liên quan.");
    if (isConfirmed) {
      setLoadingEventAction(id);
      try {
        const res = await fetch(`http://localhost:5000/api/admin/events/${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          const err = await res.json();
          await showAlert(err.error || 'Xóa sự kiện thất bại');
          return;
        }
        await fetchAllData();
      } catch (err) {
        console.error(err);
        await showAlert('Lỗi kết nối API xóa sự kiện');
      } finally {
        setLoadingEventAction(null);
      }
    }
  };

  const handleApproveEvent = async (id, approve = true) => {
    const status = approve ? 'approved' : 'rejected';
    const isConfirmed = await showConfirm(`Bạn có chắc chắn muốn ${approve ? 'duyệt' : 'từ chối'} sự kiện này?`);
    if (isConfirmed) {
      setLoadingEventAction(id);
      try {
        const res = await fetch(`http://localhost:5000/api/admin/events/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        if (!res.ok) {
          const err = await res.json();
          await showAlert(err.error || 'Thao tác thất bại');
          return;
        }
        await fetchAllData();
        await showAlert(`Đã ${approve ? 'duyệt' : 'từ chối'} sự kiện thành công!`);
      } catch (err) {
        console.error(err);
        await showAlert('Lỗi kết nối API phê duyệt sự kiện');
      } finally {
        setLoadingEventAction(null);
      }
    }
  };

  const handleAddZone = async () => {
    const isWS = eventEventType === 'workshop';
    const maxZ = isWS ? 6 : 3;
    if (eventZones.length >= maxZ) {
      await showAlert(`Chỉ cho phép tạo tối đa ${maxZ} ${isWS ? 'bàn' : 'phân khu'} cho mỗi sự kiện`);
      return;
    }
    if (!newZoneName || !newZonePrice) {
      await showAlert(`Điền thông tin ${isWS ? 'bàn' : 'phân khu'}`);
      return;
    }
    if (isWS) {
      const chairs = Math.min(14, Math.max(1, Number(newZoneCapacity) || 6));
      setEventZones([...eventZones, { id: `zone-${Date.now()}`, name: newZoneName, price: Number(newZonePrice), isStanding: false, availableTickets: chairs, rows: null, cols: null }]);
      setNewZoneName('');
      setNewZoneCapacity('6');
      return;
    }
    let capacity = 0;
    let rows = null;
    let cols = null;
    if (newZoneIsStanding) {
      if (!newZoneCapacity) { await showAlert("Vui lòng nhập số vé đăng ký"); return; }
      capacity = Number(newZoneCapacity);
    } else {
      if (!newZoneRows || !newZoneCols) { await showAlert("Vui lòng nhập số hàng và số ghế mỗi hàng"); return; }
      rows = Number(newZoneRows);
      cols = Number(newZoneCols);
      capacity = rows * cols;
    }
    setEventZones([...eventZones, { id: `zone-${Date.now()}`, name: newZoneName, price: Number(newZonePrice), isStanding: newZoneIsStanding, availableTickets: capacity, rows, cols }]);
    setNewZoneName('');
    setNewZonePrice('');
    setNewZoneCapacity('');
    setNewZoneRows('');
    setNewZoneCols('');
  };

  const handleRemoveZone = (zoneId) => {
    setEventZones(eventZones.filter(z => z.id !== zoneId));
  };

  const handleTogglePaymentStatus = async (bookingId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/bookings/${bookingId}/payment`, {
        method: 'PUT'
      });
      if (!res.ok) {
        const err = await res.json();
        await showAlert(err.error || 'Cập nhật trạng thái thanh toán thất bại');
        return;
      }
      await fetchAllData();
    } catch (err) {
      console.error(err);
      await showAlert('Lỗi kết nối API cập nhật thanh toán');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    const isConfirmed = await showConfirm("Bạn có chắc chắn muốn hủy đơn hàng này và toàn bộ vé liên quan?");
    if (isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/api/admin/bookings/${bookingId}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          const err = await res.json();
          await showAlert(err.error || 'Hủy đơn hàng thất bại');
          return;
        }
        await fetchAllData();
      } catch (err) {
        console.error(err);
        await showAlert('Lỗi kết nối API hủy đơn hàng');
      }
    }
  };

  const handleCancelExpiredBookings = async () => {
    const expiredCount = bookings.filter(b =>
      b.paymentStatus !== 'Paid' &&
      (Date.now() - new Date(b.createdAt).getTime()) > expiryMinutes * 60 * 1000
    ).length;
    if (expiredCount === 0) {
      await showAlert(`Không có đơn nào chưa thanh toán quá ${expiryMinutes} phút.`);
      return;
    }
    const confirmed = await showConfirm(`Hủy ${expiredCount} đơn CHƯA THANH TOÁN quá ${expiryMinutes} phút? Ghế sẽ được trả lại.`);
    if (!confirmed) return;
    setExpiryLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/bookings/expire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiryMinutes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Lỗi server ${res.status}`);
      const { cancelled } = data;
      await showAlert(`Đã hủy ${cancelled} đơn quá hạn. Ghế đã được trả lại.`);
      await fetchAllData();
    } catch (err) {
      await showAlert('Lỗi: ' + err.message);
    } finally {
      setExpiryLoading(false);
    }
  };

  const handleToggleResaleStatus = async (ticketId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/resale/${ticketId}/status`, {
        method: 'PUT'
      });
      if (!res.ok) {
        const err = await res.json();
        await showAlert(err.error || 'Cập nhật trạng thái vé ký gửi thất bại');
        return;
      }
      await fetchAllData();
    } catch (err) {
      console.error(err);
      await showAlert('Lỗi kết nối API cập nhật vé ký gửi');
    }
  };

  const handleDeleteResale = async (ticketId) => {
    const isConfirmed = await showConfirm("Xóa tin đăng bán lại này? Vé gốc sẽ quay về trạng thái hoạt động bình thường.");
    if (isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/api/admin/resale/${ticketId}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          const err = await res.json();
          await showAlert(err.error || 'Xóa tin đăng thất bại');
          return;
        }
        await fetchAllData();
      } catch (err) {
        console.error(err);
        await showAlert('Lỗi kết nối API xóa tin đăng');
      }
    }
  };

  const handleEditCreatorClick = (creator) => {
    setEditingCreatorId(creator.id);
    setCreatorName(creator.name);
    setCreatorType(creator.type || '');
    setCreatorFilterType(creator.filterType || 'Nghệ Sĩ');
    setCreatorLogo(creator.logo || '');
    setCreatorIcon(creator.icon || 'mic');
    setCreatorRating(creator.rating || '5.0');
    setCreatorFollowers(creator.followers || '');
    setCreatorEventCount(creator.eventCount || '');
    setCreatorLocation(creator.location || '');
    setCreatorDescription(creator.description || '');
    setCreatorAccentColor(creator.accentColor || '139, 92, 246');
    setCreatorStats(creator.stats || '');
  };

  const handleCreateNewCreatorClick = () => {
    setEditingCreatorId('new');
    setCreatorName('');
    setCreatorType('Ca Sĩ');
    setCreatorFilterType('Nghệ Sĩ');
    setCreatorLogo('https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80');
    setCreatorIcon('mic');
    setCreatorRating('5.0');
    setCreatorFollowers('100k');
    setCreatorEventCount('10+');
    setCreatorLocation('Toàn quốc');
    setCreatorDescription('');
    setCreatorAccentColor('139, 92, 246');
    setCreatorStats('10+ Show');
  };

  const handleSaveCreator = async (e) => {
    e.preventDefault();
    if (!creatorName) {
      await showAlert("Vui lòng nhập tên nhà tổ chức.");
      return;
    }

    const payload = {
      name: creatorName,
      type: creatorType,
      filterType: creatorFilterType,
      logo: creatorLogo,
      icon: creatorIcon,
      rating: creatorRating,
      followers: creatorFollowers,
      eventCount: creatorEventCount,
      location: creatorLocation,
      description: creatorDescription,
      accentColor: creatorAccentColor,
      stats: creatorStats
    };

    try {
      let res;
      if (editingCreatorId === 'new') {
        res = await fetch('http://localhost:5000/api/admin/creators', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`http://localhost:5000/api/admin/creators/${editingCreatorId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const err = await res.json();
        await showAlert(err.error || 'Lưu nhà tổ chức thất bại');
        return;
      }

      await fetchAllData();
      setEditingCreatorId(null);
    } catch (err) {
      console.error(err);
      await showAlert('Lỗi kết nối API lưu nhà tổ chức');
    }
  };

  const handleDeleteCreator = async (id) => {
    const isConfirmed = await showConfirm("Bạn có chắc chắn muốn xóa nhà tổ chức này? Các sự kiện liên quan sẽ được gỡ liên kết (chuyển về không có nhà tổ chức).");
    if (isConfirmed) {
      try {
        const res = await fetch(`http://localhost:5000/api/admin/creators/${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          const err = await res.json();
          await showAlert(err.error || 'Xóa nhà tổ chức thất bại');
          return;
        }
        await fetchAllData();
      } catch (err) {
        console.error(err);
        await showAlert('Lỗi kết nối API xóa nhà tổ chức');
      }
    }
  };

  const filteredEvents = events.filter(ev => {
    const term = eventSearch.toLowerCase().trim();
    const matchSearch = !term || 
      (ev.title && ev.title.toLowerCase().includes(term)) || 
      (ev.location && ev.location.toLowerCase().includes(term));
    const matchCat = eventFilter === 'all' || ev.category === eventFilter;
    return matchSearch && matchCat;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (eventSort === 'name-asc') return (a.title || '').localeCompare(b.title || '');
    if (eventSort === 'name-desc') return (b.title || '').localeCompare(a.title || '');
    if (eventSort === 'date-asc') return (a.date || '').localeCompare(b.date || '');
    if (eventSort === 'date-desc') return (b.date || '').localeCompare(a.date || '');
    return 0;
  });

  const totalEventPages = Math.max(1, Math.ceil(sortedEvents.length / eventLimit));
  const paginatedEvents = sortedEvents.slice((eventPage - 1) * eventLimit, eventPage * eventLimit);

  const filteredBookings = bookings.filter(b => {
    const term = bookingSearch.toLowerCase().trim();
    const matchSearch = !term ||
      (b.ticketId && b.ticketId.toLowerCase().includes(term)) ||
      (b.fullName && b.fullName.toLowerCase().includes(term)) ||
      (b.email && b.email.toLowerCase().includes(term)) ||
      (b.phone && b.phone.toLowerCase().includes(term)) ||
      (b.eventTitle && b.eventTitle.toLowerCase().includes(term));
    const matchStatus = bookingFilter === 'all' || b.paymentStatus === bookingFilter;
    return matchSearch && matchStatus;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (bookingSort === 'date-desc') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (bookingSort === 'date-asc') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    if (bookingSort === 'price-desc') return (b.totalPrice || 0) - (a.totalPrice || 0);
    if (bookingSort === 'price-asc') return (a.totalPrice || 0) - (b.totalPrice || 0);
    return 0;
  });

  const totalBookingPages = Math.max(1, Math.ceil(sortedBookings.length / bookingLimit));
  const paginatedBookings = sortedBookings.slice((bookingPage - 1) * bookingLimit, bookingPage * bookingLimit);

  const filteredResale = tickets.filter(t => {
    const term = resaleSearch.toLowerCase().trim();
    const matchSearch = !term ||
      (t.eventTitle && t.eventTitle.toLowerCase().includes(term)) ||
      (t.sellerName && t.sellerName.toLowerCase().includes(term)) ||
      (t.seatInfo && t.seatInfo.toLowerCase().includes(term));
    const matchStatus = resaleFilter === 'all' || t.status === resaleFilter;
    return matchSearch && matchStatus;
  });

  const sortedResale = [...filteredResale].sort((a, b) => {
    const aDiscount = a.originalPrice > a.resalePrice ? ((a.originalPrice - a.resalePrice) / a.originalPrice) : 0;
    const bDiscount = b.originalPrice > b.resalePrice ? ((b.originalPrice - b.resalePrice) / b.originalPrice) : 0;
    if (resaleSort === 'discount-desc') return bDiscount - aDiscount;
    if (resaleSort === 'discount-asc') return aDiscount - bDiscount;
    if (resaleSort === 'price-asc') return (a.resalePrice || 0) - (b.resalePrice || 0);
    if (resaleSort === 'price-desc') return (b.resalePrice || 0) - (a.resalePrice || 0);
    return 0;
  });

  const totalResalePages = Math.max(1, Math.ceil(sortedResale.length / resaleLimit));
  const paginatedResale = sortedResale.slice((resalePage - 1) * resaleLimit, resalePage * resaleLimit);

  const filteredCreators = creators.filter(c => {
    const term = creatorSearch.toLowerCase().trim();
    const matchSearch = !term ||
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.location && c.location.toLowerCase().includes(term)) ||
      (c.type && c.type.toLowerCase().includes(term));
    const matchFilter = creatorFilter === 'all' || c.filterType === creatorFilter;
    return matchSearch && matchFilter;
  });

  const sortedCreators = [...filteredCreators].sort((a, b) => {
    if (creatorSort === 'name-asc') return (a.name || '').localeCompare(b.name || '');
    if (creatorSort === 'name-desc') return (b.name || '').localeCompare(a.name || '');
    if (creatorSort === 'rating-desc') return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
    return 0;
  });

  const totalCreatorPages = Math.max(1, Math.ceil(sortedCreators.length / creatorLimit));
  const paginatedCreators = sortedCreators.slice((creatorPage - 1) * creatorLimit, creatorPage * creatorLimit);

  return (
    <section className="glass-panel admin-global-wrapper" style={{ margin: '0 0 48px 0', padding: '32px', textAlign: 'left', minHeight: '92vh' }}>
      <style>{`
        .admin-global-wrapper {
          background: var(--admin-global-bg, rgba(18, 14, 32, 0.45)) !important;
          border: 1px solid var(--admin-global-border, rgba(255, 255, 255, 0.06)) !important;
          backdrop-filter: blur(24px);
          box-shadow: var(--admin-global-shadow, 0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)) !important;
        }

        .admin-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 32px;
          margin-top: 24px;
          align-items: start;
        }

        .admin-sidebar {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 20px 14px;
          backdrop-filter: blur(20px);
          box-shadow: var(--inset-glow), var(--glass-shadow);
          position: sticky;
          top: 24px;
        }

        .admin-sidebar-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-muted);
          padding: 12px 16px;
          border-radius: 8px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          position: relative;
          overflow: hidden;
        }

        .admin-sidebar-btn:hover {
          color: var(--text-white);
          background: rgba(139, 92, 246, 0.08);
          border-color: rgba(139, 92, 246, 0.15);
        }

        .admin-sidebar-btn.active {
          color: var(--text-white);
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%);
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .admin-sidebar-btn.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 15%;
          height: 70%;
          width: 3px;
          background: linear-gradient(to bottom, var(--brand-violet), var(--brand-cyan));
          border-radius: 2px;
        }

        .admin-main-content {
          min-width: 0;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .kpi-card {
          position: relative;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 22px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          backdrop-filter: blur(20px);
          box-shadow: var(--inset-glow), var(--glass-shadow);
        }

        .kpi-card::before {
          content: '';
          position: absolute;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          filter: blur(50px);
          opacity: 0;
          pointer-events: none;
          z-index: 1;
          bottom: -40px;
          right: -40px;
          transition: opacity 0.5s ease, transform 0.5s ease;
          transform: scale(0.8);
        }

        .kpi-card:hover::before {
          opacity: 0.16;
          transform: scale(1.15);
        }

        .kpi-card.kpi-revenue::before {
          background: var(--brand-cyan);
        }
        .kpi-card.kpi-sold::before {
          background: var(--brand-gold);
        }
        .kpi-card.kpi-events::before {
          background: var(--text-white);
        }
        .kpi-card.kpi-resale::before {
          background: oklch(70% 0.18 300);
        }

        .kpi-card:hover {
          border-color: var(--glass-border-hover);
          transform: translateY(-4px);
          box-shadow: var(--glass-shadow);
        }

        .kpi-card.kpi-revenue:hover {
          border-color: rgba(6, 182, 212, 0.35);
          box-shadow: 0 12px 30px rgba(6, 182, 212, 0.08);
        }

        .kpi-card.kpi-sold:hover {
          border-color: rgba(253, 218, 13, 0.35);
          box-shadow: 0 12px 30px rgba(253, 218, 13, 0.08);
        }

        .kpi-card.kpi-events:hover {
          border-color: var(--glass-border-hover);
          box-shadow: var(--glass-shadow);
        }

        .kpi-card.kpi-resale:hover {
          border-color: rgba(139, 92, 246, 0.35);
          box-shadow: 0 12px 30px rgba(139, 92, 246, 0.08);
        }

        .kpi-value {
          font-size: 26px;
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          letter-spacing: -0.02em;
          display: block;
          margin-top: 4px;
          line-height: 1.2;
          color: var(--text-white);
        }

        .kpi-icon-wrapper {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 2;
          border: 1px solid transparent;
        }

        .kpi-card.kpi-revenue .kpi-icon-wrapper {
          background: rgba(6, 182, 212, 0.08);
          color: var(--brand-cyan);
          border-color: rgba(6, 182, 212, 0.15);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.1);
        }
        .kpi-card.kpi-sold .kpi-icon-wrapper {
          background: rgba(253, 218, 13, 0.08);
          color: var(--brand-gold);
          border-color: rgba(253, 218, 13, 0.15);
          box-shadow: 0 0 15px rgba(253, 218, 13, 0.1);
        }
        .kpi-card.kpi-events .kpi-icon-wrapper {
          background: var(--glass-bg);
          color: var(--text-white);
          border-color: var(--glass-border);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.05);
        }
        .kpi-card.kpi-resale .kpi-icon-wrapper {
          background: rgba(139, 92, 246, 0.08);
          color: oklch(70% 0.18 300);
          border-color: rgba(139, 92, 246, 0.15);
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.1);
        }

        /* Bento Grid & Visual Dashboard */
        .dashboard-bento-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 24px;
          margin-top: 24px;
        }
        @media (max-width: 1024px) {
          .dashboard-bento-grid {
            grid-template-columns: 1fr;
          }
        }

        .bento-panel {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(12px);
          box-shadow: var(--inset-glow), var(--glass-shadow);
        }

        .bento-event-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          transition: all 0.25s ease;
        }
        .bento-event-row:hover {
          background: rgba(139, 92, 246, 0.05);
          border-color: rgba(139, 92, 246, 0.2);
          transform: translateX(4px);
        }
        .bento-event-thumb {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
          flex-shrink: 0;
        }
        .bento-event-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .bento-event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .bento-event-title {
          font-weight: 600;
          color: var(--text-white);
          font-size: 13.5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bento-event-stats {
          font-size: 11.5px;
          color: var(--text-muted);
          font-family: var(--font-mono);
          flex-shrink: 0;
        }
        .bento-progress-wrapper {
          height: 8px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }
        .bento-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--brand-violet) 0%, var(--brand-cyan) 100%);
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .visual-gauge-container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 20px 0;
        }

        .visual-stats-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 24px;
          border-top: 1px solid var(--glass-border);
          padding-top: 16px;
        }

        .visual-stats-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .live-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
        }
        @keyframes pulseGreen {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        .admin-table-wrapper {
          width: 100%;
          overflow-x: auto;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13.5px;
        }

        .admin-table th {
          background: rgba(139, 92, 246, 0.05);
          padding: 14px 18px;
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--text-white);
          border-bottom: 1px solid var(--glass-border);
          font-size: 12.5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .admin-table td {
          padding: 16px 18px;
          border-bottom: 1px solid var(--glass-border);
          color: var(--text-secondary);
        }

        .admin-table tr:hover td {
          background: rgba(139, 92, 246, 0.04);
          color: var(--text-white);
        }

        .action-icon-btn {
          background: transparent;
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-icon-btn:hover {
          color: var(--text-white);
          background: rgba(139, 92, 246, 0.1);
          border-color: var(--glass-border-hover);
        }

        .action-icon-btn.btn-delete:hover {
          color: oklch(70% 0.18 30);
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.25);
        }

        .action-icon-btn.btn-check:hover {
          color: oklch(72% 0.17 150);
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.25);
        }

        .admin-status-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 8px;
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .admin-status-badge.paid {
          background: rgba(16, 185, 129, 0.15);
          color: oklch(72% 0.17 150);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .admin-status-badge.pending {
          background: rgba(245, 158, 11, 0.15);
          color: oklch(75% 0.14 70);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .admin-status-badge.organizer {
          background: rgba(139, 92, 246, 0.15);
          color: oklch(75% 0.18 300);
          border: 1px solid rgba(139, 92, 246, 0.3);
        }

        .admin-status-badge.client {
          background: rgba(128, 128, 128, 0.1);
          color: var(--text-muted);
          border: 1px solid var(--glass-border);
        }

        .admin-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .admin-form-label {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-muted);
        }

        .admin-form-input,
        .admin-form-textarea,
        .admin-form-select {
          background: var(--admin-input-bg, rgba(255, 255, 255, 0.07));
          border: 1px solid var(--admin-input-border, rgba(255, 255, 255, 0.18));
          border-radius: 8px;
          padding: 10px 14px;
          color: var(--admin-input-color, #fff);
          font-size: 13.5px;
          outline: none;
          transition: all 0.3s ease;
          width: 100%;
          box-sizing: border-box;
        }

        .admin-form-input,
        .admin-form-select {
          min-height: 42px;
        }

        .admin-form-input:focus,
        .admin-form-textarea:focus,
        .admin-form-select:focus {
          border-color: var(--brand-violet, rgba(167, 139, 250, 0.45));
          background: var(--admin-input-bg-focus, rgba(255, 255, 255, 0.12));
        }

        .admin-custom-picker-container {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .admin-custom-datepicker-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          width: 280px;
          background: var(--admin-dropdown-bg, rgba(18, 14, 32, 0.95));
          backdrop-filter: blur(20px);
          border: 1px solid var(--admin-dropdown-border, rgba(167, 139, 250, 0.2));
          border-radius: 12px;
          padding: 16px;
          z-index: 1000;
          box-shadow: var(--admin-dropdown-shadow, 0 10px 25px rgba(0, 0, 0, 0.5));
        }

        .datepicker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .datepicker-nav-btn {
          background: var(--admin-input-bg, rgba(255, 255, 255, 0.05));
          border: 1px solid var(--admin-input-border, rgba(255, 255, 255, 0.1));
          color: var(--text-white, #fff);
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .datepicker-nav-btn:hover {
          background: rgba(167, 139, 250, 0.2);
          border-color: rgba(167, 139, 250, 0.4);
        }

        .datepicker-month-year {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-white, #fff);
        }

        .datepicker-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          text-align: center;
          margin-bottom: 8px;
        }

        .datepicker-weekday {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .datepicker-days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }

        .datepicker-day {
          aspect-ratio: 1;
        }

        .datepicker-day-btn {
          aspect-ratio: 1;
          background: transparent;
          border: none;
          color: var(--text-white, #fff);
          font-size: 12.5px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .datepicker-day-btn:hover {
          background: rgba(139, 92, 246, 0.1);
        }

        .datepicker-day-btn.today {
          border: 1px solid rgba(167, 139, 250, 0.5);
          color: #a78bfa;
        }

        .datepicker-day-btn.selected {
          background: linear-gradient(135deg, #a78bfa, #8b5cf6);
          color: #fff;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
          font-weight: bold;
        }

        .admin-custom-timepicker-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          width: 220px;
          background: var(--admin-dropdown-bg, rgba(18, 14, 32, 0.95));
          backdrop-filter: blur(20px);
          border: 1px solid var(--admin-dropdown-border, rgba(167, 139, 250, 0.2));
          border-radius: 12px;
          padding: 12px;
          z-index: 1000;
          box-shadow: var(--admin-dropdown-shadow, 0 10px 25px rgba(0, 0, 0, 0.5));
        }

        .timepicker-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }

        .timepicker-column {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .timepicker-column-header {
          text-align: center;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 4px;
        }

        .timepicker-column-list {
          height: 160px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding-right: 4px;
        }

        .timepicker-column-list::-webkit-scrollbar {
          width: 4px;
        }

        .timepicker-column-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .timepicker-column-list::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.2);
          border-radius: 2px;
        }

        .timepicker-column-list::-webkit-scrollbar-thumb:hover {
          background: rgba(167, 139, 250, 0.4);
        }

        .timepicker-item-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 12.5px;
          padding: 6px 0;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .timepicker-item-btn:hover {
          background: rgba(139, 92, 246, 0.1);
          color: var(--text-white);
        }

        .timepicker-item-btn.selected {
          background: rgba(167, 139, 250, 0.15);
          color: #c084fc;
          font-weight: 600;
          border: 1px solid rgba(167, 139, 250, 0.3);
        }

        .timepicker-footer {
          border-top: 1px solid var(--glass-border);
          padding-top: 8px;
          display: flex;
          justify-content: flex-end;
        }

        .timepicker-confirm-btn {
          background: linear-gradient(135deg, #a78bfa, #8b5cf6);
          color: #fff;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }

        .timepicker-confirm-btn:hover {
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
          transform: translateY(-1px);
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .zone-pill-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--glass-bg);
          border: 1px dashed var(--glass-border);
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 12px;
        }

        .admin-custom-select-container {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        .admin-custom-select-trigger {
          background: var(--admin-input-bg, rgba(255, 255, 255, 0.07));
          border: 1px solid var(--admin-input-border, rgba(255, 255, 255, 0.18));
          border-radius: 8px;
          padding: 10px 14px;
          color: var(--admin-input-color, #fff);
          font-size: 13.5px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
          user-select: none;
          min-height: 42px;
        }

        .admin-custom-select-trigger:hover,
        .admin-custom-select-trigger.active {
          border-color: var(--brand-violet, rgba(167, 139, 250, 0.45));
          background: var(--admin-input-bg-focus, rgba(255, 255, 255, 0.12));
        }

        .select-arrow-icon {
          transition: transform 0.3s ease;
          color: var(--text-muted);
        }

        .select-arrow-icon.open {
          transform: rotate(180deg);
          color: var(--text-white, #fff);
        }

        .admin-custom-select-options {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: var(--admin-dropdown-bg, rgba(18, 15, 30, 0.98));
          border: 1px solid var(--admin-dropdown-border, rgba(255, 255, 255, 0.12));
          border-radius: 8px;
          padding: 6px 0;
          margin: 0;
          list-style: none;
          z-index: 100;
          max-height: 240px;
          overflow-y: auto;
          box-shadow: var(--admin-dropdown-shadow, 0 10px 25px -5px rgba(0, 0, 0, 0.7));
          backdrop-filter: blur(12px);
        }

        .admin-custom-select-option {
          padding: 10px 14px;
          color: var(--text-muted);
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .admin-custom-select-option:hover {
          background: var(--admin-option-hover-bg, rgba(139, 92, 246, 0.15));
          color: var(--admin-option-hover-color, #fff);
        }

        .admin-custom-select-option.selected {
          background: var(--admin-option-selected-bg, rgba(139, 92, 246, 0.25));
          color: var(--admin-option-selected-color, #fff);
          font-weight: 600;
        }

        .admin-toolbar-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: flex-end;
          margin-bottom: 20px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 16px;
        }

        .admin-toolbar-row .admin-custom-select-trigger {
          min-height: 38px;
          padding: 8px 12px;
        }

        .admin-toolbar-item {
          flex: 1;
          min-width: 180px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .admin-toolbar-item.search-item {
          flex: 1.8;
        }

        .admin-pagination-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-top: none;
          border-radius: 0 0 12px 12px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .pagination-info {
          font-size: 13px;
          color: var(--text-muted);
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pagination-btn {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 13px;
          font-weight: 600;
        }

        .pagination-btn:hover:not(:disabled) {
          background: rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.35);
          color: var(--text-white);
        }

        .pagination-btn.active {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.45);
          color: var(--text-white);
        }

        .pagination-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .pagination-limit-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ 
            fontSize: '28px', 
            fontFamily: 'var(--font-body)', 
            fontWeight: 800, 
            color: 'var(--text-white)', 
            margin: 0, 
            letterSpacing: '-0.02em', 
            background: 'var(--title-gradient, linear-gradient(135deg, #ffffff 40%, rgba(255, 255, 255, 0.7) 100%))', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            AuraPass Control Center
          </h2>
        </div>
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="admin-theme-toggle-btn"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-white)',
            cursor: 'pointer',
            padding: '10px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            boxShadow: 'var(--glass-shadow)',
            backdropFilter: 'blur(10px)',
            webkitBackdropFilter: 'blur(10px)'
          }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={15} style={{ color: '#fbbf24' }} />
              <span>Chế độ sáng</span>
            </>
          ) : (
            <>
              <Moon size={15} style={{ color: '#8b5cf6' }} />
              <span>Chế độ tối</span>
            </>
          )}
        </button>
      </div>

      <div className="admin-layout">
        
        <aside className="admin-sidebar">
          <button 
            className={`admin-sidebar-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => { setActiveTab('analytics'); setEditingEventId(null); }}
          >
            <LayoutDashboard size={16} />
            Bảng Thống Kê
          </button>
          <button 
            className={`admin-sidebar-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => { setActiveTab('events'); }}
          >
            <Calendar size={16} />
            Quản Lý Sự Kiện
          </button>
          <button 
            className={`admin-sidebar-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('bookings'); setEditingEventId(null); }}
          >
            <Ticket size={16} />
            Đơn Đặt Vé ({bookings.length})
          </button>
          <button 
            className={`admin-sidebar-btn ${activeTab === 'resale' ? 'active' : ''}`}
            onClick={() => { setActiveTab('resale'); setEditingEventId(null); }}
          >
            <RefreshCw size={16} />
            Vé Sang Nhượng ({tickets.length})
          </button>
          <button 
            className={`admin-sidebar-btn ${activeTab === 'creators' ? 'active' : ''}`}
            onClick={() => { setActiveTab('creators'); setEditingCreatorId(null); }}
          >
            <Users size={16} />
            Quản Lý Nhà Tổ Chức ({creators.length})
          </button>
          <button 
            className={`admin-sidebar-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => { setActiveTab('users'); setEditingEventId(null); setEditingCreatorId(null); }}
          >
            <User size={16} />
            Quản Lý Tài Khoản ({users.length})
          </button>
          <button 
            className={`admin-sidebar-btn ${activeTab === 'approve-events' ? 'active' : ''}`}
            onClick={() => { setActiveTab('approve-events'); setEditingEventId(null); setEditingCreatorId(null); }}
          >
            <CheckSquare size={16} />
            Duyệt Sự Kiện ({events.filter(e => e.status === 'pending').length})
          </button>

        </aside>

        <main className="admin-main-content">

          {activeTab === 'analytics' && (
            (() => {
              const totalPaidTickets = bookings
                .filter(b => b.paymentStatus === 'Paid')
                .reduce((sum, b) => sum + b.count, 0);

              const totalCapacity = events.reduce((sum, ev) => {
                const evAllocated = ev.zones?.reduce((zSum, z) => zSum + (z.availableTickets || 0), 0) || 100;
                const evSold = bookings
                  .filter(b => b.eventId === ev.id && b.paymentStatus === 'Paid')
                  .reduce((bSum, b) => bSum + b.count, 0);
                return sum + evAllocated + evSold;
              }, 0);

              const paidBookingsCount = bookings.filter(b => b.paymentStatus === 'Paid').length;
              const pendingBookingsCount = bookings.filter(b => b.paymentStatus !== 'Paid').length;
              const paymentRate = bookings.length > 0
                ? Math.round((paidBookingsCount / bookings.length) * 100)
                : 0;

              return (
                <div>
                  <div className="kpi-grid">
                    <div className="kpi-card kpi-revenue">
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Tổng Doanh Thu</span>
                        <strong className="kpi-value" style={{ color: 'var(--brand-cyan)' }}>{formatPrice(totalRevenue)}</strong>
                      </div>
                      <div className="kpi-icon-wrapper">
                        <DollarSign size={22} />
                      </div>
                    </div>

                    <div className="kpi-card kpi-sold">
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Vé Đã Bán</span>
                        <strong className="kpi-value" style={{ color: 'var(--brand-gold)' }}>{totalTicketsSold} Vé</strong>
                      </div>
                      <div className="kpi-icon-wrapper">
                        <Ticket size={22} />
                      </div>
                    </div>

                    <div className="kpi-card kpi-events">
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Tổng Sự Kiện</span>
                        <strong className="kpi-value" style={{ color: '#fff' }}>{events.length} Show</strong>
                      </div>
                      <div className="kpi-icon-wrapper">
                        <Calendar size={22} />
                      </div>
                    </div>

                    <div className="kpi-card kpi-resale">
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 500 }}>Vé Resale Hoạt Động</span>
                        <strong className="kpi-value" style={{ color: 'oklch(70% 0.18 300)' }}>{tickets.filter(t => t.status === 'available').length} Vé</strong>
                      </div>
                      <div className="kpi-icon-wrapper">
                        <RefreshCw size={22} />
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-bento-grid">
                    {/* Cột trái: Tiến trình bán vé */}
                    <div className="bento-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-body)', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={16} color="var(--brand-cyan)" /> Trạng thái bán vé của sự kiện
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {events.slice(0, 4).map((ev) => {
                          const totalAllocated = ev.zones?.reduce((sum, z) => sum + (z.availableTickets || 0), 0) || 100;
                          const soldForThisEvent = bookings
                            .filter(b => b.eventId === ev.id && b.paymentStatus === 'Paid')
                            .reduce((sum, b) => sum + b.count, 0);
                          const percent = Math.min(Math.round((soldForThisEvent / (soldForThisEvent + totalAllocated)) * 100), 100);

                          return (
                            <div key={ev.id} className="bento-event-row">
                              <img src={ev.image} alt={ev.title} className="bento-event-thumb" />
                              <div className="bento-event-info">
                                <div className="bento-event-header">
                                  <span className="bento-event-title">{ev.title}</span>
                                  <span className="bento-event-stats">
                                    {soldForThisEvent} / {soldForThisEvent + totalAllocated} Ghế ({percent}%)
                                  </span>
                                </div>
                                <div className="bento-progress-wrapper">
                                  <div className="bento-progress-bar" style={{ width: `${percent}%` }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {events.length === 0 && (
                          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Chưa có dữ liệu sự kiện nào phù hợp.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cột phải: Tình trạng Thu Tiền */}
                    <div className="bento-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '320px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-body)', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <DollarSign size={16} color="var(--brand-emerald)" /> Tình trạng Thu Tiền
                        </h3>
                        <div className="visual-gauge-container">
                          <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
                            <defs>
                              <linearGradient id="paymentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--brand-emerald)" />
                                <stop offset="100%" stopColor="var(--brand-cyan)" />
                              </linearGradient>
                            </defs>
                            <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="10" />
                            <circle
                              cx="90" cy="90" r="70" fill="none"
                              stroke={bookings.length === 0 ? 'rgba(255,255,255,0.06)' : 'url(#paymentGradient)'}
                              strokeWidth="10"
                              strokeDasharray={2 * Math.PI * 70}
                              strokeDashoffset={2 * Math.PI * 70 * (1 - paymentRate / 100)}
                              strokeLinecap="round"
                              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
                            />
                          </svg>
                          <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '32px', fontFamily: 'Outfit', fontWeight: 800, color: 'var(--text-white)', lineHeight: 1 }}>
                              {paymentRate}%
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
                              Đã Thu Tiền
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="visual-stats-list">
                        <div className="visual-stats-item">
                          <span style={{ color: 'var(--text-muted)' }}>Đã thu tiền</span>
                          <span style={{ fontWeight: 600, color: 'var(--brand-emerald)' }}>{paidBookingsCount} đơn</span>
                        </div>
                        <div className="visual-stats-item">
                          <span style={{ color: 'var(--text-muted)' }}>Chưa thu</span>
                          <span style={{ fontWeight: 600, color: 'var(--brand-gold)' }}>{pendingBookingsCount} đơn</span>
                        </div>
                        <div className="visual-stats-item">
                          <span style={{ color: 'var(--text-muted)' }}>Tổng doanh thu</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-white)' }}>{formatPrice(totalRevenue)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}

          {activeTab === 'events' && (
            <div>
              {editingEventId === null ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', color: '#fff', margin: 0, fontFamily: 'var(--font-display)' }}>Danh sách Sự kiện</h3>
                    <button 
                      onClick={handleCreateNewEventClick}
                      className="btn-primary" 
                      style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      <PlusCircle size={14} /> Thêm Sự Kiện Mới
                    </button>
                  </div>

                  <div className="admin-toolbar-row">
                    <div className="admin-toolbar-item search-item">
                      <label className="admin-form-label">Tìm Kiếm Sự Kiện</label>
                      <input 
                        type="text" 
                        value={eventSearch} 
                        onChange={(e) => setEventSearch(e.target.value)} 
                        placeholder="Tìm theo tên show, địa điểm..." 
                        className="admin-form-input" 
                      />
                    </div>
                    <div className="admin-toolbar-item">
                      <CustomSelect 
                        label="Phân Loại" 
                        value={eventFilter} 
                        onChange={setEventFilter} 
                        options={[
                          { value: 'all', label: 'Tất cả danh mục' },
                          { value: 'music', label: 'Music Concert' },
                          { value: 'theater', label: 'Theater Play' },
                          { value: 'workshop', label: 'Art Workshop' }
                        ]} 
                      />
                    </div>
                    <div className="admin-toolbar-item">
                      <CustomSelect 
                        label="Sắp Xếp" 
                        value={eventSort} 
                        onChange={setEventSort} 
                        options={[
                          { value: 'name-asc', label: 'Tên A - Z' },
                          { value: 'name-desc', label: 'Tên Z - A' },
                          { value: 'date-asc', label: 'Ngày tăng dần' },
                          { value: 'date-desc', label: 'Ngày giảm dần' }
                        ]} 
                      />
                    </div>
                  </div>

                  <div className="admin-table-wrapper" style={{ borderRadius: '12px 12px 0 0' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Hình</th>
                          <th>Tên Sự Kiện</th>
                          <th>Nhà Tổ Chức</th>
                          <th>Phân Loại</th>
                          <th>Thời Gian</th>
                          <th>Địa Điểm</th>
                          <th>Phân Khu</th>
                          <th style={{ textAlign: 'right' }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedEvents.map((ev) => (
                          <tr key={ev.id}>
                            <td>
                              <img src={ev.image} alt={ev.title} style={{ width: '48px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />
                            </td>
                            <td style={{ fontWeight: 600, color: 'var(--text-white)' }}>{ev.title}</td>
                            <td>
                              {creators.find(c => c.id === ev.creatorId)?.name || <span style={{ opacity: 0.4 }}>Không có</span>}
                            </td>
                            <td>
                              <span style={{ textTransform: 'uppercase', fontSize: '10px', color: ev.category === 'music' ? '#a78bfa' : 'var(--brand-cyan)', border: '1px solid rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                                {ev.category}
                              </span>
                            </td>
                            <td>{ev.date}</td>
                            <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.location}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {ev.zones?.map(z => (
                                  <span key={z.id} style={{ fontSize: '9px', background: 'rgba(255,255,255,0.04)', padding: '2px 4px', borderRadius: '3px' }}>
                                    {z.name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button onClick={() => handleEditEventClick(ev)} className="action-icon-btn" title="Chỉnh sửa">
                                  <Edit size={13} />
                                </button>
                                <button onClick={() => handleDeleteEvent(ev.id)} className="action-icon-btn btn-delete" title="Xóa">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {paginatedEvents.length === 0 && (
                          <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                              Không tìm thấy sự kiện nào phù hợp.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="admin-pagination-footer">
                    <div className="pagination-info">
                      Hiển thị {sortedEvents.length === 0 ? 0 : (eventPage - 1) * eventLimit + 1} - {Math.min(sortedEvents.length, eventPage * eventLimit)} trong tổng số {sortedEvents.length} sự kiện
                    </div>
                    <div className="pagination-controls">
                      <button 
                        type="button"
                        disabled={eventPage === 1} 
                        onClick={() => setEventPage(1)} 
                        className="pagination-btn"
                        title="Trang đầu"
                      >
                        «
                      </button>
                      <button 
                        type="button"
                        disabled={eventPage === 1} 
                        onClick={() => setEventPage(prev => Math.max(1, prev - 1))} 
                        className="pagination-btn"
                        title="Trang trước"
                      >
                        ‹
                      </button>
                      
                      {Array.from({ length: totalEventPages }, (_, i) => i + 1)
                        .filter(p => Math.abs(p - eventPage) <= 2 || p === 1 || p === totalEventPages)
                        .map((p, idx, arr) => {
                          const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                          return (
                            <React.Fragment key={p}>
                              {showEllipsis && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>}
                              <button 
                                type="button"
                                onClick={() => setEventPage(p)} 
                                className={`pagination-btn ${eventPage === p ? 'active' : ''}`}
                              >
                                {p}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      <button 
                        type="button"
                        disabled={eventPage === totalEventPages} 
                        onClick={() => setEventPage(prev => Math.min(totalEventPages, prev + 1))} 
                        className="pagination-btn"
                        title="Trang sau"
                      >
                        ›
                      </button>
                      <button 
                        type="button"
                        disabled={eventPage === totalEventPages} 
                        onClick={() => setEventPage(totalEventPages)} 
                        className="pagination-btn"
                        title="Trang cuối"
                      >
                        »
                      </button>
                    </div>

                    <div className="pagination-limit-wrapper">
                      <span>Hiển thị</span>
                      <div style={{ width: '110px' }}>
                        <CustomSelect 
                          value={eventLimit} 
                          onChange={(val) => setEventLimit(Number(val))} 
                          options={[
                            { value: 5, label: '5 sự kiện / trang' },
                            { value: 10, label: '10 sự kiện / trang' },
                            { value: 20, label: '20 sự kiện / trang' }
                          ]} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveEvent} className="glass-panel" style={{ padding: '28px', background: 'rgba(255,255,255,0.08)' }}>
                  <h3 style={{ fontSize: '18px', color: 'var(--text-white)', fontFamily: 'var(--font-display)', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                    {editingEventId === 'new' ? 'Tạo Sự Kiện Mới' : `Chỉnh sửa: ${eventTitle}`}
                  </h3>

                  <div className="form-grid-2">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Tên Sự Kiện *</label>
                      <input 
                        type="text" 
                        required 
                        value={eventTitle} 
                        onChange={(e) => setEventTitle(e.target.value)} 
                        className="admin-form-input" 
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                      <div className="admin-form-group">
                        <CustomSelect 
                          label="Danh Mục" 
                          value={eventCategory} 
                          onChange={setEventCategory} 
                          options={[
                            { value: 'music', label: 'Music Concert' },
                            { value: 'theater', label: 'Theater Play' },
                            { value: 'workshop', label: 'Art Workshop' }
                          ]} 
                        />
                      </div>
                      <div className="admin-form-group">
                        <CustomSelect 
                          label="Nhà Tổ Chức (Creator)" 
                          value={eventCreatorId} 
                          onChange={setEventCreatorId} 
                          placeholder="-- Không gán --"
                          options={[
                            { value: '', label: 'Không gán' },
                            ...creators.map(c => ({ value: c.id, label: c.name }))
                          ]} 
                        />
                      </div>
                      <div className="admin-form-group">
                        <CustomSelect 
                          label="Theme Màu Vé (Hero)" 
                          value={eventTheme} 
                          onChange={setEventTheme} 
                          options={[
                            { value: 'dark', label: 'Obsidian Gold' },
                            { value: 'slate', label: 'Steel Platinum' },
                            { value: 'pearl', label: 'Champagne Pearl' }
                          ]} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <CustomDatePicker 
                      label="Ngày Diễn Ra *" 
                      value={eventDate} 
                      onChange={setEventDate} 
                    />
                    <CustomTimePicker 
                      label="Giờ Diễn Ra" 
                      value={eventTime} 
                      onChange={setEventTime} 
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Địa Điểm Tổ Chức *</label>
                    <input 
                      type="text" 
                      required 
                      value={eventLocation} 
                      onChange={(e) => setEventLocation(e.target.value)} 
                      placeholder="Tên rạp/Sân vận động, Địa chỉ..." 
                      className="admin-form-input" 
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Khoảng Giá Vé *</label>
                      <input 
                        type="text" 
                        required 
                        value={eventPriceRange} 
                        onChange={(e) => setEventPriceRange(e.target.value)} 
                        placeholder="Ví dụ: 500.000đ - 3.000.000đ" 
                        className="admin-form-input" 
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Nhãn (Badge)</label>
                      <input 
                        type="text" 
                        value={eventBadge} 
                        onChange={(e) => setEventBadge(e.target.value)} 
                        placeholder="Ví dụ: Hot, Selling Fast" 
                        className="admin-form-input" 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', margin: '4px 0 20px 0', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#fff' }}>
                      <input 
                        type="checkbox" 
                        checked={eventIsFeatured} 
                        onChange={(e) => setEventIsFeatured(e.target.checked)}
                        style={{ accentColor: '#a78bfa', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span>Hiện ở Sự Kiện Nổi Bật (Spotlight)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#fff' }}>
                      <input 
                        type="checkbox" 
                        checked={eventIsTrending} 
                        onChange={(e) => setEventIsTrending(e.target.checked)}
                        style={{ accentColor: '#a78bfa', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span>Hiện ở Sự Kiện Xu Hướng (Trending)</span>
                    </label>
                  </div>

                  {/* Event Type */}
                  <div className="admin-form-group">
                    <label className="admin-form-label">Loại Sự Kiện</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[{ val: 'live', Icon: Mic, label: 'Trực tiếp' }, { val: 'online', Icon: Monitor, label: 'Trực tuyến' }, { val: 'workshop', Icon: Users, label: 'Workshop' }].map(({ val, Icon, label }) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleAdminEventTypeChange(val)}
                          style={{
                            flex: 1, padding: '8px 12px', borderRadius: '8px', border: `1px solid ${eventEventType === val ? '#a78bfa' : 'rgba(255,255,255,0.18)'}`,
                            background: eventEventType === val ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.06)',
                            color: eventEventType === val ? '#a78bfa' : 'var(--text-muted)',
                            fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                          }}
                        ><Icon size={13} strokeWidth={2} />{label}</button>
                      ))}
                    </div>
                  </div>

                  {eventEventType === 'online' && (
                    <div style={{ padding: '16px', borderRadius: '10px', border: '1px solid rgba(167,139,250,0.25)', background: 'rgba(167,139,250,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '2px' }}>THÔNG TIN SỰ KIỆN TRỰC TUYẾN</div>
                      <div className="form-grid-2">
                        <div className="admin-form-group" style={{ margin: 0 }}>
                          <label className="admin-form-label">Nền tảng</label>
                          <input type="text" value={eventPlatform} onChange={e => setEventPlatform(e.target.value)} placeholder="Zoom, Google Meet, YouTube Live..." className="admin-form-input" />
                        </div>
                        <div className="admin-form-group" style={{ margin: 0 }}>
                          <label className="admin-form-label">Mật khẩu phòng</label>
                          <input type="text" value={eventOnlinePassword} onChange={e => setEventOnlinePassword(e.target.value)} placeholder="Tuỳ chọn" className="admin-form-input" />
                        </div>
                      </div>
                      <div className="admin-form-group" style={{ margin: 0 }}>
                        <label className="admin-form-label">Link tham gia *</label>
                        <input type="text" value={eventOnlineLink} onChange={e => setEventOnlineLink(e.target.value)} placeholder="https://zoom.us/j/..." className="admin-form-input" />
                      </div>
                      <div className="form-grid-2">
                        <div className="admin-form-group" style={{ margin: 0 }}>
                          <label className="admin-form-label">Giá vé (VNĐ) *</label>
                          <input type="number" min="0" value={eventOnlinePrice} onChange={e => setEventOnlinePrice(e.target.value)} placeholder="500000" className="admin-form-input" />
                        </div>
                        <div className="admin-form-group" style={{ margin: 0 }}>
                          <label className="admin-form-label">Số lượng tham gia tối đa *</label>
                          <input type="number" min="1" value={eventOnlineCapacity} onChange={e => setEventOnlineCapacity(e.target.value)} placeholder="100" className="admin-form-input" />
                        </div>
                      </div>
                      <div className="admin-form-group" style={{ margin: 0 }}>
                        <label className="admin-form-label">Hướng dẫn tham gia</label>
                        <textarea rows={3} value={eventOnlineInstructions} onChange={e => setEventOnlineInstructions(e.target.value)} placeholder="1. Nhấp vào link bên dưới&#10;2. Nhập mật khẩu phòng (nếu có)&#10;3. Vào phòng trước 5 phút..." className="admin-form-textarea" />
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                        🔒 Link bị ẩn công khai — chỉ hiển thị cho người mua sau khi thanh toán thành công.
                      </p>
                    </div>
                  )}

                  <div className="admin-form-group">
                    <label className="admin-form-label">Ảnh Poster Sự Kiện *</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input 
                        type="text" 
                        required 
                        value={eventImage} 
                        onChange={(e) => setEventImage(e.target.value)} 
                        placeholder="URL ảnh hoặc chọn file từ PC..." 
                        className="admin-form-input" 
                        style={{ flex: 1 }}
                      />
                      <label 
                        className="admin-custom-select-trigger" 
                        style={{ 
                          padding: '0 16px', 
                          borderRadius: '8px', 
                          fontSize: '13px', 
                          cursor: 'pointer', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          gap: '8px',
                          whiteSpace: 'nowrap',
                          height: '42px',
                          border: '1px solid rgba(167, 139, 250, 0.25)',
                          background: 'rgba(139, 92, 246, 0.08)',
                          color: '#c084fc',
                          boxSizing: 'border-box'
                        }}
                      >
                        Chọn file
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleImageUpload(e, setEventImage)} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Mô Tả Sự Kiện</label>
                    <textarea 
                      rows={3} 
                      value={eventDescription} 
                      onChange={(e) => setEventDescription(e.target.value)} 
                      className="admin-form-textarea" 
                    />
                  </div>

                  {eventEventType === 'workshop' && (<div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop: '20px' }}>
                    <h4 style={{ color: 'var(--text-white)', fontSize: '15px', fontFamily: 'var(--font-display)', margin: '0 0 16px 0' }}>
                      Cấu Hình Bàn Workshop ({eventZones.length}/6)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 48px', gap: '12px', alignItems: 'end', marginBottom: '16px' }}>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-form-label" style={{ fontSize: '11px' }}>Tên Bàn</label>
                        <input type="text" placeholder="Bàn VIP, Bàn A..." value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} className="admin-form-input" style={{ padding: '8px', minHeight: '38px', fontSize: '13.5px' }} />
                      </div>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-form-label" style={{ fontSize: '11px' }}>Ghế / Bàn (≤14)</label>
                        <input type="number" min="1" max="14" placeholder="6" value={newZoneCapacity} onChange={(e) => setNewZoneCapacity(e.target.value)} className="admin-form-input" style={{ padding: '8px', minHeight: '38px', fontSize: '13.5px' }} />
                      </div>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-form-label" style={{ fontSize: '11px' }}>Giá / Ghế (VNĐ)</label>
                        <input type="number" placeholder="300000" value={newZonePrice} onChange={(e) => setNewZonePrice(e.target.value)} className="admin-form-input" style={{ padding: '8px', minHeight: '38px', fontSize: '13.5px' }} />
                      </div>
                      <button type="button" onClick={handleAddZone} disabled={eventZones.length >= 6} style={{ padding: 0, height: '38px', width: '48px', borderRadius: '8px', cursor: eventZones.length >= 6 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: eventZones.length >= 6 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #a78bfa, #8b5cf6)', color: eventZones.length >= 6 ? 'rgba(255,255,255,0.2)' : '#fff', boxSizing: 'border-box' }}>
                        <PlusCircle size={18} />
                      </button>
                    </div>
                    <div style={{ marginTop: '8px', marginBottom: '16px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      * Mỗi bàn tối đa 14 ghế. Người dùng sẽ chọn ghế cụ thể quanh bàn khi đặt vé. Tối đa 6 bàn.
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {eventZones.map((z) => (
                        <div key={z.id} className="zone-pill-item">
                          <div>
                            <strong style={{ color: '#fff' }}>{z.name}</strong>
                            <span style={{ opacity: 0.6, fontSize: '10px', marginLeft: '6px' }}>
                              ({z.availableTickets} ghế) - {formatPrice(z.price)}/ghế
                            </span>
                          </div>
                          <button type="button" onClick={() => handleRemoveZone(z.id)} style={{ background: 'none', border: 'none', color: 'oklch(70% 0.18 30)', cursor: 'pointer', padding: 0 }}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>)}

                  {eventEventType === 'live' && (<div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop: '20px' }}>
                    <h4 style={{ color: 'var(--text-white)', fontSize: '15px', fontFamily: 'var(--font-display)', margin: '0 0 16px 0' }}>
                      Cấu Hình Phân Khu Vé ({eventZones.length}/3)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr) 48px', gap: '12px', alignItems: 'end', marginBottom: '16px' }}>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-form-label" style={{ fontSize: '11px' }}>Tên Phân Khu</label>
                        <input type="text" placeholder="VIP, GA..." value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} className="admin-form-input" style={{ padding: '8px', minHeight: '38px', fontSize: '13.5px' }} />
                      </div>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-form-label" style={{ fontSize: '11px' }}>Giá Vé (VNĐ)</label>
                        <input type="number" placeholder="2500000" value={newZonePrice} onChange={(e) => setNewZonePrice(e.target.value)} className="admin-form-input" style={{ padding: '8px', minHeight: '38px', fontSize: '13.5px' }} />
                      </div>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <CustomSelect label="Vé Đứng GA?" value={newZoneIsStanding ? '1' : '0'} onChange={(val) => setNewZoneIsStanding(val === '1')} small={true} options={[{ value: '0', label: 'Ghế ngồi' }, { value: '1', label: 'Đứng GA' }]} />
                      </div>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-form-label" style={{ fontSize: '11px' }}>Số Hàng Ghế</label>
                        <input type="number" placeholder="3" disabled={newZoneIsStanding} value={newZoneIsStanding ? '' : newZoneRows} onChange={(e) => setNewZoneRows(e.target.value)} className="admin-form-input" style={{ padding: '8px', minHeight: '38px', fontSize: '13.5px', opacity: newZoneIsStanding ? 0.35 : 1 }} />
                      </div>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-form-label" style={{ fontSize: '11px' }}>Ghế mỗi hàng</label>
                        <input type="number" placeholder="5" disabled={newZoneIsStanding} value={newZoneIsStanding ? '' : newZoneCols} onChange={(e) => setNewZoneCols(e.target.value)} className="admin-form-input" style={{ padding: '8px', minHeight: '38px', fontSize: '13.5px', opacity: newZoneIsStanding ? 0.35 : 1 }} />
                      </div>
                      <div className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-form-label" style={{ fontSize: '11px' }}>{newZoneIsStanding ? 'Số Vé Đăng Ký' : 'Tổng Số Ghế'}</label>
                        <input type="number" placeholder="100" disabled={!newZoneIsStanding} value={newZoneIsStanding ? newZoneCapacity : (newZoneRows && newZoneCols ? Number(newZoneRows) * Number(newZoneCols) : 0)} onChange={(e) => setNewZoneCapacity(e.target.value)} className="admin-form-input" style={{ padding: '8px', minHeight: '38px', fontSize: '13.5px', opacity: !newZoneIsStanding ? 0.6 : 1 }} />
                      </div>
                      <button type="button" onClick={handleAddZone} disabled={eventZones.length >= 3} style={{ padding: 0, height: '38px', width: '48px', borderRadius: '8px', cursor: eventZones.length >= 3 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: eventZones.length >= 3 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #a78bfa, #8b5cf6)', color: eventZones.length >= 3 ? 'rgba(255,255,255,0.2)' : '#fff', boxShadow: eventZones.length >= 3 ? 'none' : '0 0 12px rgba(139,92,246,0.35)', boxSizing: 'border-box' }}>
                        <PlusCircle size={18} />
                      </button>
                    </div>
                    <div style={{ marginTop: '8px', marginBottom: '16px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      * Ghi chú: Đối với phân khu <strong>Đứng GA</strong>, bạn chỉ cần nhập tổng số vé đăng ký. Đối với phân khu <strong>Ghế ngồi</strong>, hệ thống tự động tính Tổng số ghế bằng Số hàng × Số ghế mỗi hàng và tự động sinh sơ đồ chọn ghế trực quan cho khách hàng.
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {eventZones.map((z) => (
                        <div key={z.id} className="zone-pill-item">
                          <div>
                            <strong style={{ color: '#fff' }}>{z.name}</strong>
                            <span style={{ opacity: 0.6, fontSize: '10px', marginLeft: '6px' }}>
                              ({z.isStanding ? 'Đứng' : `${z.rows}x${z.cols}`}) - {formatPrice(z.price)} - SL: {z.availableTickets}
                            </span>
                          </div>
                          <button type="button" onClick={() => handleRemoveZone(z.id)} style={{ background: 'none', border: 'none', color: 'oklch(70% 0.18 30)', cursor: 'pointer', padding: 0 }}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>)}

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                    <button
                      type="button"
                      onClick={() => setEditingEventId(null)}
                      className="btn-secondary" 
                      style={{ padding: '10px 24px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Hủy Bỏ
                    </button>
                    <button 
                      type="submit" 
                      disabled={loadingSaveEvent || loadingSaveCreator}
                      className="btn-primary" 
                      style={{ padding: '10px 24px', borderRadius: '8px', cursor: (loadingSaveEvent || loadingSaveCreator) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: (loadingSaveEvent || loadingSaveCreator) ? 0.7 : 1 }}
                    >
                      {(loadingSaveEvent || loadingSaveCreator) ? (
                        <>
                          <RefreshCw size={14} spin /> Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save size={14} /> Lưu Lại
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

           {activeTab === 'bookings' && (
            <div>
              <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>Quản lý Đơn Đặt Vé</h3>

              <div className="admin-toolbar-row">
                <div className="admin-toolbar-item search-item">
                  <label className="admin-form-label">Tìm Kiếm Đơn Vé</label>
                  <input 
                    type="text" 
                    value={bookingSearch} 
                    onChange={(e) => setBookingSearch(e.target.value)} 
                    placeholder="Tìm theo Mã vé, Khách hàng, Sự kiện..." 
                    className="admin-form-input" 
                  />
                </div>
                <div className="admin-toolbar-item">
                  <CustomSelect 
                    label="Trạng Thái Thanh Toán" 
                    value={bookingFilter} 
                    onChange={setBookingFilter} 
                    options={[
                      { value: 'all', label: 'Tất cả trạng thái' },
                      { value: 'Paid', label: 'Đã thanh toán' },
                      { value: 'Pending', label: 'Chưa thanh toán' }
                    ]} 
                  />
                </div>
                <div className="admin-toolbar-item">
                  <CustomSelect
                    label="Sắp Xếp"
                    value={bookingSort}
                    onChange={setBookingSort}
                    options={[
                      { value: 'date-desc', label: 'Ngày đặt: Mới nhất' },
                      { value: 'date-asc', label: 'Ngày đặt: Cũ nhất' },
                      { value: 'price-desc', label: 'Tổng tiền: Giảm dần' },
                      { value: 'price-asc', label: 'Tổng tiền: Tăng dần' }
                    ]}
                  />
                </div>
                <div className="admin-toolbar-item" style={{ flex: '0 0 auto' }}>
                  <label className="admin-form-label">Tự hủy sau</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      value={expiryMinutes}
                      onChange={e => setExpiryMinutes(Number(e.target.value))}
                      className="admin-form-input"
                      style={{ width: '120px', padding: '8px 12px' }}
                    >
                      <option value={15}>15 phút</option>
                      <option value={30}>30 phút</option>
                      <option value={60}>1 giờ</option>
                      <option value={120}>2 giờ</option>
                      <option value={1440}>24 giờ</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleCancelExpiredBookings}
                      disabled={expiryLoading}
                      style={{
                        padding: '8px 14px', borderRadius: '8px', border: 'none',
                        background: expiryLoading
                          ? 'oklch(45% 0.05 250)'
                          : 'linear-gradient(135deg, oklch(55% 0.18 30), oklch(48% 0.2 20))',
                        color: '#fff', fontWeight: 600, fontSize: '12px',
                        cursor: expiryLoading ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap', display: 'flex',
                        alignItems: 'center', gap: '5px',
                        boxShadow: expiryLoading ? 'none' : '0 2px 8px rgba(220,80,50,0.25)',
                        opacity: expiryLoading ? 0.7 : 1,
                        transition: 'all 0.2s'
                      }}
                    >
                      {expiryLoading
                        ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Đang xử lý...</>
                        : <><Trash2 size={13} /> Hủy quá hạn ({bookings.filter(b => b.paymentStatus !== 'Paid' && getElapsedMinutes(b.createdAt) >= expiryMinutes).length})</>
                      }
                    </button>
                  </div>
                </div>
              </div>

              <div className="admin-table-wrapper" style={{ borderRadius: '12px 12px 0 0' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã Vé</th>
                      <th>Khách Hàng</th>
                      <th>Sự Kiện & Phân Khu</th>
                      <th>Số Lượng / Ghế</th>
                      <th>Tổng Tiền</th>
                      <th>Trạng Thái</th>
                      <th>Ngày Đặt</th>
                      <th style={{ textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBookings.map((b) => (
                      <tr key={b.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-cyan)' }}>{b.ticketId}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ color: '#fff' }}>{b.fullName}</strong>
                            <span style={{ fontSize: '11px', opacity: 0.6 }}>{b.email} · {b.phone}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ color: '#fff', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.eventTitle}</strong>
                            <span style={{ fontSize: '11px', color: '#a78bfa' }}>{b.zoneName}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong>{b.count} Vé</strong>
                            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{b.seats && b.seats.length > 0 ? b.seats.join(', ') : 'Đứng GA'}</span>
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatPrice(b.totalPrice)}</td>
                        <td>
                          {(() => {
                            if (b.paymentStatus === 'Paid') {
                              return <span className="admin-status-badge paid">Đã thu tiền</span>;
                            }
                            const elapsed = getElapsedMinutes(b.createdAt);
                            const isExpired = elapsed >= expiryMinutes;
                            const isWarning = elapsed >= expiryMinutes * 0.75;
                            const timeLabel = elapsed < 60
                              ? `${elapsed} phút`
                              : `${Math.floor(elapsed / 60)}g${elapsed % 60 > 0 ? ` ${elapsed % 60}p` : ''}`;
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span className="admin-status-badge pending">Chưa thanh toán</span>
                                <span style={{
                                  fontSize: '10.5px',
                                  fontFamily: 'var(--font-mono)',
                                  color: isExpired ? 'oklch(58% 0.2 25)' : isWarning ? 'oklch(62% 0.18 60)' : 'var(--text-muted)',
                                  fontWeight: isExpired ? 700 : 500,
                                }}>
                                  {isExpired ? `⚠ Quá hạn · ${timeLabel}` : `⏱ ${timeLabel}`}
                                </span>
                              </div>
                            );
                          })()}
                        </td>
                        <td style={{ fontSize: '12.5px', whiteSpace: 'nowrap' }}>{formatDateTime(b.createdAt)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => handleTogglePaymentStatus(b.id)} 
                              className="action-icon-btn btn-check" 
                              title={b.paymentStatus === 'Paid' ? 'Đánh dấu chưa thanh toán' : 'Xác nhận đã thanh toán'}
                            >
                              <Check size={13} />
                            </button>
                            <button onClick={() => handleDeleteBooking(b.id)} className="action-icon-btn btn-delete" title="Hủy vé">
                              <X size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedBookings.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                          Không tìm thấy đơn hàng nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="admin-pagination-footer">
                <div className="pagination-info">
                  Hiển thị {sortedBookings.length === 0 ? 0 : (bookingPage - 1) * bookingLimit + 1} - {Math.min(sortedBookings.length, bookingPage * bookingLimit)} trong tổng số {sortedBookings.length} đơn đặt vé
                </div>
                <div className="pagination-controls">
                  <button 
                    type="button"
                    disabled={bookingPage === 1} 
                    onClick={() => setBookingPage(1)} 
                    className="pagination-btn"
                    title="Trang đầu"
                  >
                    «
                  </button>
                  <button 
                    type="button"
                    disabled={bookingPage === 1} 
                    onClick={() => setBookingPage(prev => Math.max(1, prev - 1))} 
                    className="pagination-btn"
                    title="Trang trước"
                  >
                    ‹
                  </button>
                  
                  {Array.from({ length: totalBookingPages }, (_, i) => i + 1)
                    .filter(p => Math.abs(p - bookingPage) <= 2 || p === 1 || p === totalBookingPages)
                    .map((p, idx, arr) => {
                      const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>}
                          <button 
                            type="button"
                            onClick={() => setBookingPage(p)} 
                            className={`pagination-btn ${bookingPage === p ? 'active' : ''}`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button 
                    type="button"
                    disabled={bookingPage === totalBookingPages} 
                    onClick={() => setBookingPage(prev => Math.min(totalBookingPages, prev + 1))} 
                    className="pagination-btn"
                    title="Trang sau"
                  >
                    ›
                  </button>
                  <button 
                    type="button"
                    disabled={bookingPage === totalBookingPages} 
                    onClick={() => setBookingPage(totalBookingPages)} 
                    className="pagination-btn"
                    title="Trang cuối"
                  >
                    »
                  </button>
                </div>

                <div className="pagination-limit-wrapper">
                  <span>Hiển thị</span>
                  <div style={{ width: '110px' }}>
                    <CustomSelect 
                      value={bookingLimit} 
                      onChange={(val) => setBookingLimit(Number(val))} 
                      options={[
                        { value: 5, label: '5 dòng / trang' },
                        { value: 10, label: '10 dòng / trang' },
                        { value: 20, label: '20 dòng / trang' }
                      ]} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resale' && (
            <div>
              <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '20px', fontFamily: 'var(--font-display)' }}>Quản lý Vé Ký Gửi (Resale Market)</h3>

              <div className="admin-toolbar-row">
                <div className="admin-toolbar-item search-item">
                  <label className="admin-form-label">Tìm Kiếm Vé Ký Gửi</label>
                  <input 
                    type="text" 
                    value={resaleSearch} 
                    onChange={(e) => setResaleSearch(e.target.value)} 
                    placeholder="Tìm theo Sự kiện, Người bán, Vị trí ghế..." 
                    className="admin-form-input" 
                  />
                </div>
                <div className="admin-toolbar-item">
                  <CustomSelect 
                    label="Trạng Thái Vé" 
                    value={resaleFilter} 
                    onChange={setResaleFilter} 
                    options={[
                      { value: 'all', label: 'Tất cả trạng thái' },
                      { value: 'available', label: 'Đang rao bán' },
                      { value: 'sold', label: 'Đã bán / Đã gỡ' }
                    ]} 
                  />
                </div>
                <div className="admin-toolbar-item">
                  <CustomSelect 
                    label="Sắp Xếp" 
                    value={resaleSort} 
                    onChange={setResaleSort} 
                    options={[
                      { value: 'discount-desc', label: 'Chiết khấu cao nhất' },
                      { value: 'discount-asc', label: 'Chiết khấu thấp nhất' },
                      { value: 'price-asc', label: 'Giá bán: Thấp đến cao' },
                      { value: 'price-desc', label: 'Giá bán: Cao đến thấp' }
                    ]} 
                  />
                </div>
              </div>

              <div className="admin-table-wrapper" style={{ borderRadius: '12px 12px 0 0' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Sự Kiện</th>
                      <th>Khu vực / Vị trí</th>
                      <th>Người Bán</th>
                      <th>Giá Gốc</th>
                      <th>Giá Bán Lại</th>
                      <th>Trạng Thái</th>
                      <th style={{ textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedResale.map((t) => {
                      const discount = t.originalPrice > t.resalePrice ? Math.round(((t.originalPrice - t.resalePrice) / t.originalPrice) * 100) : 0;
                      return (
                        <tr key={t.id}>
                          <td style={{ fontWeight: 600, color: 'var(--text-white)' }}>{t.eventTitle}</td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span>{t.zoneName}</span>
                              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--brand-cyan)' }}>{t.seatInfo}</span>
                            </div>
                          </td>
                          <td>{t.sellerName}</td>
                          <td style={{ textDecoration: 'line-through', opacity: 0.5 }}>{formatPrice(t.originalPrice)}</td>
                          <td style={{ color: 'oklch(72% 0.17 150)', fontWeight: 700 }}>
                            {formatPrice(t.resalePrice)}
                            {discount > 0 && <span style={{ fontSize: '9px', background: 'rgba(16, 185, 129, 0.15)', color: 'oklch(72% 0.17 150)', padding: '2px 4px', borderRadius: '3px', marginLeft: '6px' }}>-{discount}%</span>}
                          </td>
                          <td>
                            <span className={`admin-status-badge ${t.status === 'available' ? 'paid' : 'pending'}`}>
                              {t.status === 'available' ? 'Đang bán' : 'Đã bán/Gỡ'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button 
                                onClick={() => handleToggleResaleStatus(t.id)} 
                                className="action-icon-btn btn-check" 
                                title={t.status === 'available' ? 'Gỡ vé/Bán vé' : 'Đưa lên sàn bán lại'}
                              >
                                <RefreshCw size={12} />
                              </button>
                              <button onClick={() => handleDeleteResale(t.id)} className="action-icon-btn btn-delete" title="Xóa tin đăng">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {paginatedResale.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                          Không tìm thấy vé resale nào phù hợp.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="admin-pagination-footer">
                <div className="pagination-info">
                  Hiển thị {sortedResale.length === 0 ? 0 : (resalePage - 1) * resaleLimit + 1} - {Math.min(sortedResale.length, resalePage * resaleLimit)} trong tổng số {sortedResale.length} tin đăng
                </div>
                <div className="pagination-controls">
                  <button 
                    type="button"
                    disabled={resalePage === 1} 
                    onClick={() => setResalePage(1)} 
                    className="pagination-btn"
                    title="Trang đầu"
                  >
                    «
                  </button>
                  <button 
                    type="button"
                    disabled={resalePage === 1} 
                    onClick={() => setResalePage(prev => Math.max(1, prev - 1))} 
                    className="pagination-btn"
                    title="Trang trước"
                  >
                    ‹
                  </button>
                  
                  {Array.from({ length: totalResalePages }, (_, i) => i + 1)
                    .filter(p => Math.abs(p - resalePage) <= 2 || p === 1 || p === totalResalePages)
                    .map((p, idx, arr) => {
                      const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>}
                          <button 
                            type="button"
                            onClick={() => setResalePage(p)} 
                            className={`pagination-btn ${resalePage === p ? 'active' : ''}`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button 
                    type="button"
                    disabled={resalePage === totalResalePages} 
                    onClick={() => setResalePage(prev => Math.min(totalResalePages, prev + 1))} 
                    className="pagination-btn"
                    title="Trang sau"
                  >
                    ›
                  </button>
                  <button 
                    type="button"
                    disabled={resalePage === totalResalePages} 
                    onClick={() => setResalePage(totalResalePages)} 
                    className="pagination-btn"
                    title="Trang cuối"
                  >
                    »
                  </button>
                </div>

                <div className="pagination-limit-wrapper">
                  <span>Hiển thị</span>
                  <div style={{ width: '110px' }}>
                    <CustomSelect 
                      value={resaleLimit} 
                      onChange={(val) => setResaleLimit(Number(val))} 
                      options={[
                        { value: 5, label: '5 dòng / trang' },
                        { value: 10, label: '10 dòng / trang' },
                        { value: 20, label: '20 dòng / trang' }
                      ]} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'creators' && (
            <div>
              {editingCreatorId === null ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', color: '#fff', margin: 0, fontFamily: 'var(--font-display)' }}>Danh sách Nhà Tổ Chức</h3>
                    <button 
                      onClick={handleCreateNewCreatorClick}
                      className="btn-primary" 
                      style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                    >
                      <PlusCircle size={14} /> Thêm Nhà Tổ Chức Mới
                    </button>
                  </div>

                  <div className="admin-toolbar-row">
                    <div className="admin-toolbar-item search-item">
                      <label className="admin-form-label">Tìm Kiếm Nhà Tổ Chức</label>
                      <input 
                        type="text" 
                        value={creatorSearch} 
                        onChange={(e) => setCreatorSearch(e.target.value)} 
                        placeholder="Tìm theo Tên, Địa điểm, Phân loại..." 
                        className="admin-form-input" 
                      />
                    </div>
                    <div className="admin-toolbar-item">
                      <CustomSelect 
                        label="Phân Loại Bộ Lọc" 
                        value={creatorFilter} 
                        onChange={setCreatorFilter} 
                        options={[
                          { value: 'all', label: 'Tất cả bộ lọc' },
                          { value: 'Nghệ Sĩ', label: 'Nghệ Sĩ' },
                          { value: 'Sân Khấu', label: 'Sân Khấu' },
                          { value: 'Nhà Hát', label: 'Nhà Hát' }
                        ]} 
                      />
                    </div>
                    <div className="admin-toolbar-item">
                      <CustomSelect 
                        label="Sắp Xếp" 
                        value={creatorSort} 
                        onChange={setCreatorSort} 
                        options={[
                          { value: 'name-asc', label: 'Tên A - Z' },
                          { value: 'name-desc', label: 'Tên Z - A' },
                          { value: 'rating-desc', label: 'Đánh giá cao nhất' }
                        ]} 
                      />
                    </div>
                  </div>

                  <div className="admin-table-wrapper" style={{ borderRadius: '12px 12px 0 0' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Logo</th>
                          <th>Tên</th>
                          <th>Phân Loại</th>
                          <th>Bộ lọc</th>
                          <th>Địa Điểm</th>
                          <th>Người Theo Dõi</th>
                          <th>Đánh Giá</th>
                          <th style={{ textAlign: 'right' }}>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCreators.map((c) => (
                          <tr key={c.id}>
                            <td>
                              <img src={c.logo} alt={c.name} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '50%' }} />
                            </td>
                            <td style={{ fontWeight: 600, color: 'var(--text-white)' }}>{c.name}</td>
                            <td>{c.type}</td>
                            <td>
                              <span style={{ textTransform: 'uppercase', fontSize: '10px', color: 'var(--brand-cyan)', border: '1px solid rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                                {c.filterType}
                              </span>
                            </td>
                            <td>{c.location}</td>
                            <td>{c.followers}</td>
                            <td style={{ color: 'var(--brand-gold)', fontWeight: 'bold' }}>⭐ {c.rating || 'N/A'}</td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button onClick={() => handleEditCreatorClick(c)} className="action-icon-btn" title="Chỉnh sửa">
                                  <Edit size={13} />
                                </button>
                                <button onClick={() => handleDeleteCreator(c.id)} className="action-icon-btn btn-delete" title="Xóa">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {paginatedCreators.length === 0 && (
                          <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                              Không tìm thấy nhà tổ chức nào phù hợp.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="admin-pagination-footer">
                    <div className="pagination-info">
                      Hiển thị {sortedCreators.length === 0 ? 0 : (creatorPage - 1) * creatorLimit + 1} - {Math.min(sortedCreators.length, creatorPage * creatorLimit)} trong tổng số {sortedCreators.length} nhà tổ chức
                    </div>
                    <div className="pagination-controls">
                      <button 
                        type="button"
                        disabled={creatorPage === 1} 
                        onClick={() => setCreatorPage(1)} 
                        className="pagination-btn"
                        title="Trang đầu"
                      >
                        «
                      </button>
                      <button 
                        type="button"
                        disabled={creatorPage === 1} 
                        onClick={() => setCreatorPage(prev => Math.max(1, prev - 1))} 
                        className="pagination-btn"
                        title="Trang trước"
                      >
                        ‹
                      </button>
                      
                      {Array.from({ length: totalCreatorPages }, (_, i) => i + 1)
                        .filter(p => Math.abs(p - creatorPage) <= 2 || p === 1 || p === totalCreatorPages)
                        .map((p, idx, arr) => {
                          const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                          return (
                            <React.Fragment key={p}>
                              {showEllipsis && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>...</span>}
                              <button 
                                type="button"
                                onClick={() => setCreatorPage(p)} 
                                className={`pagination-btn ${creatorPage === p ? 'active' : ''}`}
                              >
                                {p}
                              </button>
                            </React.Fragment>
                          );
                        })}

                      <button 
                        type="button"
                        disabled={creatorPage === totalCreatorPages} 
                        onClick={() => setCreatorPage(prev => Math.min(totalCreatorPages, prev + 1))} 
                        className="pagination-btn"
                        title="Trang sau"
                      >
                        ›
                      </button>
                      <button 
                        type="button"
                        disabled={creatorPage === totalCreatorPages} 
                        onClick={() => setCreatorPage(totalCreatorPages)} 
                        className="pagination-btn"
                        title="Trang cuối"
                      >
                        »
                      </button>
                    </div>

                    <div className="pagination-limit-wrapper">
                      <span>Hiển thị</span>
                      <div style={{ width: '110px' }}>
                        <CustomSelect 
                          value={creatorLimit} 
                          onChange={(val) => setCreatorLimit(Number(val))} 
                          options={[
                            { value: 5, label: '5 dòng / trang' },
                            { value: 10, label: '10 dòng / trang' },
                            { value: 20, label: '20 dòng / trang' }
                          ]} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveCreator} className="glass-panel" style={{ padding: '28px', background: 'rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: '18px', color: '#fff', fontFamily: 'var(--font-display)', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px' }}>
                    {editingCreatorId === 'new' ? 'Tạo Nhà Tổ Chức Mới' : `Chỉnh sửa: ${creatorName}`}
                  </h3>

                  <div className="form-grid-2">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Tên Nhà Tổ Chức *</label>
                      <input 
                        type="text" 
                        required 
                        value={creatorName} 
                        onChange={(e) => setCreatorName(e.target.value)} 
                        className="admin-form-input" 
                      />
                    </div>
                    <div className="form-grid-2">
                      <div className="admin-form-group">
                        <label className="admin-form-label">Phân Loại (Type)</label>
                        <input 
                          type="text" 
                          value={creatorType} 
                          onChange={(e) => setCreatorType(e.target.value)} 
                          placeholder="Ví dụ: Ca Sĩ, Ban Nhạc, Nhà Hát..." 
                          className="admin-form-input" 
                        />
                      </div>
                      <div className="admin-form-group">
                        <CustomSelect 
                          label="Bộ Lọc (Filter Type)" 
                          value={creatorFilterType} 
                          onChange={setCreatorFilterType} 
                          options={[
                            { value: 'Nghệ Sĩ', label: 'Nghệ Sĩ' },
                            { value: 'Sân Khấu', label: 'Sân Khấu' },
                            { value: 'Nhà Hát', label: 'Nhà Hát' }
                          ]} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Ảnh Logo *</label>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <input 
                          type="text" 
                          required 
                          value={creatorLogo} 
                          onChange={(e) => setCreatorLogo(e.target.value)} 
                          placeholder="URL logo hoặc chọn file từ PC..." 
                          className="admin-form-input" 
                          style={{ flex: 1 }}
                        />
                        <label 
                          className="admin-custom-select-trigger" 
                          style={{ 
                            padding: '0 16px', 
                            borderRadius: '8px', 
                            fontSize: '13px', 
                            cursor: 'pointer', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap',
                            height: '42px',
                            border: '1px solid rgba(167, 139, 250, 0.25)',
                            background: 'rgba(139, 92, 246, 0.08)',
                            color: '#c084fc',
                            boxSizing: 'border-box'
                          }}
                        >
                          Chọn file
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleImageUpload(e, setCreatorLogo)} 
                            style={{ display: 'none' }} 
                          />
                        </label>
                      </div>
                    </div>
                    <div className="form-grid-2">
                      <div className="admin-form-group">
                        <CustomSelect 
                          label="Icon hiển thị" 
                          value={creatorIcon} 
                          onChange={setCreatorIcon} 
                          options={[
                            { value: 'mic', label: 'Micro (mic)' },
                            { value: 'music', label: 'Music Note' },
                            { value: 'drama', label: 'Theater Mask (drama)' },
                            { value: 'headphones', label: 'Headphones' }
                          ]} 
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Đánh Giá (1.0 - 5.0)</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          min="1.0" 
                          max="5.0" 
                          value={creatorRating} 
                          onChange={(e) => setCreatorRating(e.target.value)} 
                          className="admin-form-input" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Số Người Theo Dõi (Followers)</label>
                      <input 
                        type="text" 
                        value={creatorFollowers} 
                        onChange={(e) => setCreatorFollowers(e.target.value)} 
                        placeholder="Ví dụ: 500k, 1.2M..." 
                        className="admin-form-input" 
                      />
                    </div>
                    <div className="admin-form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label className="admin-form-label" style={{ margin: 0 }}>Số Sự Kiện (Event Count)</label>
                        <span 
                          onClick={() => {
                            const count = events.filter(ev => ev.creatorId === editingCreatorId).length;
                            setCreatorEventCount(`${count}+`);
                            setCreatorStats(`${count}+ Show`);
                          }}
                          style={{ fontSize: '11.5px', color: 'var(--brand-cyan)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 500 }}
                          title="Click để tự động điền số lượng sự kiện thực tế từ database"
                        >
                          Thực tế: {events.filter(ev => ev.creatorId === editingCreatorId).length} Show (Áp dụng)
                        </span>
                      </div>
                      <input 
                        type="text" 
                        value={creatorEventCount} 
                        onChange={(e) => setCreatorEventCount(e.target.value)} 
                        placeholder="Ví dụ: 10+, 50+..." 
                        className="admin-form-input" 
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Địa Điểm (Location)</label>
                      <input 
                        type="text" 
                        value={creatorLocation} 
                        onChange={(e) => setCreatorLocation(e.target.value)} 
                        placeholder="Ví dụ: Quận 1, TP.HCM hoặc Toàn quốc" 
                        className="admin-form-input" 
                      />
                    </div>
                    <div className="form-grid-2">
                      <div className="admin-form-group">
                        <label className="admin-form-label">Màu Chủ Đạo (RGB Accent Color)</label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <input 
                            type="color" 
                            value={rgbToHex(creatorAccentColor)} 
                            onChange={(e) => setCreatorAccentColor(hexToRgb(e.target.value))} 
                            style={{ 
                              width: '54px', 
                              height: '42px', 
                              padding: 0, 
                              border: '1px solid var(--glass-border)',
                              borderRadius: '8px',
                              background: 'transparent',
                              cursor: 'pointer',
                              boxSizing: 'border-box'
                            }} 
                          />
                          <input 
                            type="text" 
                            required
                            value={creatorAccentColor} 
                            onChange={(e) => setCreatorAccentColor(e.target.value)} 
                            placeholder="Ví dụ: 139, 92, 246" 
                            className="admin-form-input" 
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Thống kê ngắn (Stats)</label>
                        <input 
                          type="text" 
                          value={creatorStats} 
                          onChange={(e) => setCreatorStats(e.target.value)} 
                          placeholder="Ví dụ: 20+ Concert" 
                          className="admin-form-input" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Mô Tả Nhà Tổ Chức</label>
                    <textarea 
                      rows={4} 
                      value={creatorDescription} 
                      onChange={(e) => setCreatorDescription(e.target.value)} 
                      className="admin-form-textarea" 
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                    <button 
                      type="button" 
                      onClick={() => setEditingCreatorId(null)} 
                      className="btn-secondary" 
                      style={{ padding: '10px 24px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      Hủy Bỏ
                    </button>
                    <button 
                      type="submit" 
                      disabled={loadingSaveEvent || loadingSaveCreator}
                      className="btn-primary" 
                      style={{ padding: '10px 24px', borderRadius: '8px', cursor: (loadingSaveEvent || loadingSaveCreator) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: (loadingSaveEvent || loadingSaveCreator) ? 0.7 : 1 }}
                    >
                      {(loadingSaveEvent || loadingSaveCreator) ? (
                        <>
                          <RefreshCw size={14} spin /> Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save size={14} /> Lưu Lại
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Quản Lý Tài Khoản Người Dùng
                </h3>
                <button 
                  onClick={() => setShowCreateUserModal(true)}
                  className="btn-primary" 
                  style={{ padding: '8px 16px', fontSize: '12.5px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  <PlusCircle size={14} /> Cấp tài khoản mới
                </button>
              </div>

              <div className="admin-toolbar-row">
                <div className="admin-toolbar-item search-item">
                  <label className="admin-form-label">Tìm kiếm tài khoản</label>
                  <input 
                    type="text" 
                    placeholder="Tìm theo username, tên, email..." 
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="admin-form-input"
                  />
                </div>
                <div className="admin-toolbar-item">
                  <CustomSelect 
                    label="Lọc vai trò"
                    value={userFilter}
                    onChange={setUserFilter}
                    options={[
                      { value: 'all', label: 'Tất cả vai trò' },
                      { value: 'client', label: 'Khách hàng (Client)' },
                      { value: 'organizer', label: 'Ban tổ chức (Organizer)' },
                      { value: 'admin', label: 'Quản trị viên (Admin)' }
                    ]}
                  />
                </div>
                <div className="admin-toolbar-item">
                  <CustomSelect 
                    label="Sắp xếp theo"
                    value={userSort}
                    onChange={setUserSort}
                    options={[
                      { value: 'username-asc', label: 'Username (A-Z)' },
                      { value: 'username-desc', label: 'Username (Z-A)' },
                      { value: 'email-asc', label: 'Địa chỉ Email' }
                    ]}
                  />
                </div>
              </div>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tên Đăng Nhập</th>
                      <th>Họ và Tên</th>
                      <th>Email</th>
                      <th>Số Điện Thoại</th>
                      <th>Vai Trò</th>
                      <th style={{ textAlign: 'right' }}>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Không tìm thấy tài khoản nào phù hợp
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map(u => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 600, color: 'var(--text-white)', fontFamily: 'var(--font-mono)' }}>{u.username}</td>
                          <td>{u.fullName || '—'}</td>
                          <td>{u.email}</td>
                          <td>{u.phone || '—'}</td>
                          <td>
                            <span className={`admin-status-badge ${
                              u.role === 'admin' ? 'paid' : (u.role === 'organizer' ? 'organizer' : 'client')
                            }`}>
                              {u.role === 'admin' ? 'Admin' : (u.role === 'organizer' ? 'Nhà tổ chức' : 'Client')}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button 
                                onClick={() => { setChangePasswordUserId(u.id); setNewPasswordInput(''); }}
                                className="action-icon-btn" 
                                title="Đổi mật khẩu"
                              >
                                <Key size={13} />
                              </button>
                              <button 
                                onClick={() => handleToggleUserRole(u.id)}
                                className="action-icon-btn btn-check" 
                                title="Thay đổi vai trò (Admin / Nhà tổ chức / Client)"
                              >
                                <RefreshCw size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(u.id)}
                                className="action-icon-btn btn-delete" 
                                title="Xóa tài khoản"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="admin-pagination-footer">
                <div className="pagination-info">
                  Hiển thị {(userPage - 1) * userLimit + 1} - {Math.min(userPage * userLimit, sortedUsers.length)} trong tổng số {sortedUsers.length} tài khoản
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="pagination-limit-wrapper">
                    <span>Số dòng:</span>
                    <CustomSelect 
                      value={userLimit}
                      onChange={setUserLimit}
                      options={[
                        { value: 5, label: '5 dòng' },
                        { value: 10, label: '10 dòng' },
                        { value: 20, label: '20 dòng' }
                      ]}
                      small={true}
                    />
                  </div>
                  <div className="pagination-controls">
                    <button 
                      disabled={userPage === 1}
                      onClick={() => setUserPage(userPage - 1)}
                      className="pagination-btn"
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalUserPages }, (_, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setUserPage(idx + 1)}
                        className={`pagination-btn ${userPage === idx + 1 ? 'active' : ''}`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button 
                      disabled={userPage === totalUserPages}
                      onClick={() => setUserPage(userPage + 1)}
                      className="pagination-btn"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              </div>

              {showCreateUserModal && (
                <div className="custom-popup-overlay">
                  <form onSubmit={handleCreateUser} className="custom-popup-card" style={{ maxWidth: '680px', width: '90%', background: 'var(--admin-popup-bg)', border: '1px solid var(--admin-popup-border)', boxShadow: 'var(--admin-popup-shadow)' }}>
                    <h4 className="custom-popup-title">Cấp Tài Khoản Mới</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px', textAlign: 'left' }}>
                      {/* Cột bên trái */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Tên đăng nhập *</label>
                          <input 
                            type="text" 
                            required 
                            value={newUsername} 
                            onChange={(e) => setNewUsername(e.target.value)} 
                            className="admin-form-input" 
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Mật khẩu *</label>
                          <input 
                            type="password" 
                            required 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            className="admin-form-input" 
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Họ và tên</label>
                          <input 
                            type="text" 
                            value={newFullName} 
                            onChange={(e) => setNewFullName(e.target.value)} 
                            className="admin-form-input" 
                          />
                        </div>
                        <div className="admin-form-group">
                          <CustomSelect 
                            label="Vai trò" 
                            value={newRole} 
                            onChange={setNewRole} 
                            options={[
                              { value: 'client', label: 'Khách hàng (Client)' },
                              { value: 'organizer', label: 'Ban tổ chức (Organizer)' },
                              { value: 'admin', label: 'Quản trị viên (Admin)' }
                            ]} 
                          />
                        </div>
                      </div>

                      {/* Cột bên phải */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Email *</label>
                          <input 
                            type="email" 
                            required 
                            value={newEmail} 
                            onChange={(e) => setNewEmail(e.target.value)} 
                            className="admin-form-input" 
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Xác nhận mật khẩu *</label>
                          <input 
                            type="password" 
                            required 
                            value={confirmNewPassword} 
                            onChange={(e) => setConfirmNewPassword(e.target.value)} 
                            className="admin-form-input" 
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Số điện thoại</label>
                          <input 
                            type="text" 
                            value={newPhone} 
                            onChange={(e) => setNewPhone(e.target.value)} 
                            className="admin-form-input" 
                          />
                        </div>
                        {newRole === 'organizer' ? (
                          <div className="admin-form-group">
                            <CustomSelect
                              label="Liên kết Đối tác/Nghệ sĩ"
                              value={selectedCreatorId}
                              onChange={setSelectedCreatorId}
                              options={[
                                { value: "", label: "-- Không gán (Tạo sau) --" },
                                ...creators.map(c => ({ value: c.id, label: `${c.name} (${c.type || 'Nghệ sĩ'})` }))
                              ]}
                            />
                          </div>
                        ) : (
                          <div className="admin-form-group" style={{ visibility: 'hidden', height: '62px' }}>
                            <label className="admin-form-label">&nbsp;</label>
                            <div className="admin-form-input" style={{ border: 'none', background: 'transparent' }} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="custom-popup-actions" style={{ marginTop: '24px' }}>
                      <button 
                        type="button" 
                        className="custom-popup-btn-cancel" 
                        onClick={() => {
                          setShowCreateUserModal(false);
                          setNewUsername('');
                          setNewPassword('');
                          setConfirmNewPassword('');
                          setNewEmail('');
                          setNewFullName('');
                          setNewPhone('');
                          setNewRole('client');
                          setSelectedCreatorId('');
                        }}
                      >
                        Hủy
                      </button>
                      <button type="submit" className="custom-popup-btn-confirm">
                        Lưu Lại
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {changePasswordUserId && (
                <div className="custom-popup-overlay">
                  <form onSubmit={handleChangePassword} className="custom-popup-card" style={{ maxWidth: '400px', width: '90%', background: 'var(--admin-popup-bg)', border: '1px solid var(--admin-popup-border)', boxShadow: 'var(--admin-popup-shadow)' }}>
                    <h4 className="custom-popup-title">Đổi Mật Khẩu</h4>
                    <p className="custom-popup-message" style={{ fontSize: '13px', marginBottom: '16px' }}>
                      Nhập mật khẩu mới cho tài khoản: <strong>{users.find(u => u.id === changePasswordUserId)?.username}</strong>
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', textAlign: 'left' }}>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Mật khẩu mới *</label>
                        <input 
                          type="password" 
                          required 
                          value={newPasswordInput} 
                          onChange={(e) => setNewPasswordInput(e.target.value)} 
                          className="admin-form-input" 
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Xác nhận mật khẩu mới *</label>
                        <input 
                          type="password" 
                          required 
                          value={confirmPasswordInput} 
                          onChange={(e) => setConfirmPasswordInput(e.target.value)} 
                          className="admin-form-input" 
                        />
                      </div>
                    </div>
                    <div className="custom-popup-actions" style={{ marginTop: '24px' }}>
                      <button 
                        type="button" 
                        className="custom-popup-btn-cancel" 
                        onClick={() => { setChangePasswordUserId(null); setNewPasswordInput(''); setConfirmPasswordInput(''); }}
                      >
                        Hủy
                      </button>
                      <button type="submit" className="custom-popup-btn-confirm">
                        Xác nhận
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'approve-events' && (
            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 6px 0' }}>Phê Duyệt Sự Kiện</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                    Danh sách các sự kiện do Ban Tổ Chức gửi lên đang chờ phê duyệt để hiển thị công khai.
                  </p>
                </div>
              </div>

              <div className="admin-table-wrapper" style={{ borderRadius: '12px 12px 0 0' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ảnh</th>
                      <th>Tên Sự Kiện</th>
                      <th>Nhà Tổ Chức</th>
                      <th>Ngày Giờ</th>
                      <th>Địa Điểm</th>
                      <th>Giá Vé</th>
                      <th style={{ textAlign: 'center' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.filter(e => e.status === 'pending').length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                          Không có sự kiện nào đang chờ phê duyệt
                        </td>
                      </tr>
                    ) : (
                      events.filter(e => e.status === 'pending').map(event => {
                        const organizer = users.find(u => u.id === event.organizerId);
                        return (
                          <tr key={event.id}>
                            <td>
                              <img src={event.image} alt={event.title} style={{ width: '48px', height: '64px', objectFit: 'cover', borderRadius: '4px' }} />
                            </td>
                            <td style={{ fontWeight: 700, color: 'var(--text-white)' }}>{event.title}</td>
                            <td>{organizer ? organizer.fullName : 'Hệ thống'}</td>
                            <td>{event.date} {event.time}</td>
                            <td>{event.location}</td>
                            <td>{event.priceRange}</td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button
                                  onClick={() => handleApproveEvent(event.id, true)}
                                  disabled={loadingEventAction === event.id}
                                  className="btn-primary"
                                  style={{
                                    background: '#10b981',
                                    border: 'none',
                                    color: '#fff',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    cursor: loadingEventAction === event.id ? 'not-allowed' : 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    opacity: loadingEventAction === event.id ? 0.7 : 1
                                  }}
                                >
                                  {loadingEventAction === event.id ? (
                                    <>
                                      <RefreshCw size={12} spin /> Đang duyệt...
                                    </>
                                  ) : (
                                    <>
                                      <Check size={12} /> Duyệt
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleApproveEvent(event.id, false)}
                                  disabled={loadingEventAction === event.id}
                                  className="btn-secondary"
                                  style={{
                                    background: '#ef4444',
                                    border: 'none',
                                    color: '#fff',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    cursor: loadingEventAction === event.id ? 'not-allowed' : 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    opacity: loadingEventAction === event.id ? 0.7 : 1
                                  }}
                                >
                                  {loadingEventAction === event.id ? (
                                    <>
                                      <RefreshCw size={12} spin /> Đang từ chối...
                                    </>
                                  ) : (
                                    <>
                                      <X size={12} /> Từ chối
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}



        </main>
      </div>
      {popup && (
        <div className="custom-popup-overlay">
          <div className="custom-popup-card">
            <h4 className="custom-popup-title">{popup.title}</h4>
            <p className="custom-popup-message">{popup.message}</p>
            <div className="custom-popup-actions">
              {popup.type === 'confirm' && (
                <button className="custom-popup-btn-cancel" onClick={popup.onCancel}>
                  Hủy
                </button>
              )}
              <button className="custom-popup-btn-confirm" onClick={popup.onConfirm}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
