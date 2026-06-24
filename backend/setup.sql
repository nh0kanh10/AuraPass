-- IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'AuraPassDB')
-- BEGIN
--     CREATE DATABASE AuraPassDB;
-- END
-- GO

-- USE AuraPassDB;
-- GO

IF OBJECT_ID('dbo.ResaleTickets', 'U') IS NOT NULL DROP TABLE dbo.ResaleTickets;
IF OBJECT_ID('dbo.Tickets', 'U') IS NOT NULL DROP TABLE dbo.Tickets;
IF OBJECT_ID('dbo.Bookings', 'U') IS NOT NULL DROP TABLE dbo.Bookings;
IF OBJECT_ID('dbo.Zones', 'U') IS NOT NULL DROP TABLE dbo.Zones;
IF OBJECT_ID('dbo.Events', 'U') IS NOT NULL DROP TABLE dbo.Events;
IF OBJECT_ID('dbo.Creators', 'U') IS NOT NULL DROP TABLE dbo.Creators;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

CREATE TABLE Users (
    id NVARCHAR(50) PRIMARY KEY,
    username NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    phone NVARCHAR(50) NULL,
    fullName NVARCHAR(255) NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'client',
    createdAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE Creators (
    id NVARCHAR(50) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    type NVARCHAR(100) NULL,
    filterType NVARCHAR(50) NULL,
    logo NVARCHAR(1000) NULL,
    icon NVARCHAR(50) NULL,
    rating DECIMAL(3, 1) NULL,
    followers NVARCHAR(50) NULL,
    eventCount NVARCHAR(50) NULL,
    location NVARCHAR(255) NULL,
    description NVARCHAR(MAX) NULL,
    accentColor NVARCHAR(50) NULL,
    stats NVARCHAR(100) NULL
);
GO

CREATE TABLE Events (
    id NVARCHAR(50) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    category NVARCHAR(50) NOT NULL,
    date NVARCHAR(100) NULL,
    time NVARCHAR(50) NULL,
    location NVARCHAR(550) NULL,
    priceRange NVARCHAR(100) NULL,
    image NVARCHAR(1000) NULL,
    badge NVARCHAR(50) NULL,
    theme NVARCHAR(50) NULL DEFAULT 'dark',
    isFeatured BIT NULL DEFAULT 0,
    isTrending BIT NULL DEFAULT 0,
    creatorId NVARCHAR(50) FOREIGN KEY REFERENCES Creators(id),
    status NVARCHAR(50) NOT NULL DEFAULT 'approved',
    organizerId NVARCHAR(50) FOREIGN KEY REFERENCES Users(id)
);
GO

CREATE TABLE Zones (
    id NVARCHAR(50) PRIMARY KEY,
    eventId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Events(id),
    name NVARCHAR(100) NOT NULL,
    price DECIMAL(18, 2) NOT NULL,
    isStanding BIT NOT NULL DEFAULT 0,
    availableTickets INT NOT NULL,
    [rows] INT NULL,
    cols INT NULL
);
GO

CREATE TABLE Bookings (
    id NVARCHAR(50) PRIMARY KEY,
    userId NVARCHAR(50) FOREIGN KEY REFERENCES Users(id),
    eventId NVARCHAR(50) FOREIGN KEY REFERENCES Events(id),
    zoneId NVARCHAR(50) FOREIGN KEY REFERENCES Zones(id),
    count INT NOT NULL,
    seats NVARCHAR(MAX) NULL,
    totalPrice DECIMAL(18, 2) NOT NULL,
    fullName NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    phone NVARCHAR(50) NOT NULL,
    ticketId NVARCHAR(50) NOT NULL,
    paymentStatus NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    bookingType NVARCHAR(50) NOT NULL DEFAULT 'primary',
    createdAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE Tickets (
    id NVARCHAR(50) PRIMARY KEY,
    bookingId NVARCHAR(50) FOREIGN KEY REFERENCES Bookings(id),
    userId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Users(id),
    eventId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Events(id),
    zoneId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Zones(id),
    seatNumber NVARCHAR(50) NULL,
    qrCode NVARCHAR(255) UNIQUE NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'active',
    purchaseType NVARCHAR(50) NOT NULL DEFAULT 'primary',
    createdAt DATETIME NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE ResaleTickets (
    id NVARCHAR(50) PRIMARY KEY,
    ticketId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES Tickets(id),
    eventId NVARCHAR(50) FOREIGN KEY REFERENCES Events(id),
    eventTitle NVARCHAR(255) NULL,
    zoneName NVARCHAR(100) NULL,
    seatInfo NVARCHAR(100) NULL,
    originalPrice DECIMAL(18, 2) NULL,
    resalePrice DECIMAL(18, 2) NULL,
    sellerId NVARCHAR(50) FOREIGN KEY REFERENCES Users(id),
    status NVARCHAR(50) NOT NULL DEFAULT 'available',
    createdAt DATETIME NOT NULL DEFAULT GETDATE()
);
GO

INSERT INTO Users (id, username, password, email, phone, fullName, role)
VALUES
('user-1', 'tuantran', 'tuantran123', 'tuantran@gmail.com', '0912345678', N'Trần Văn Tuấn', 'client'),
('user-2', 'ngocle', 'ngocle123', 'ngocle@yahoo.com', '0901234567', N'Lê Thị Ngọc', 'client'),
('user-3', 'admin', 'admin123', 'admin@aurapass.vn', '0248888999', N'AuraPass Administrator', 'admin'),
('user-organizer-1', 'organizer', 'organizer123', 'organizer@aurapass.vn', '0911112222', N'Nhà Tổ Chức Aura', 'organizer'),
('user-seller-1', 'namnguyen', 'nam123', 'namnguyen@gmail.com', '0988888888', N'Nguyễn Hoàng Nam', 'client'),
('user-seller-2', 'thupam', 'thu123', 'thupam@gmail.com', '0977777777', N'Phạm Minh Thư', 'client'),
('user-seller-3', 'phuocdo', 'phuoc123', 'phuocdo@gmail.com', '0966666666', N'Đỗ Hữu Phước', 'client');
GO

INSERT INTO Creators (id, name, type, filterType, logo, icon, rating, followers, eventCount, location, description, accentColor, stats)
VALUES 
('saigon-opera', N'Nhà Hát Thành Phố', N'Nhà Hát Lịch Sử', N'Nhà Hát', 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?q=80&w=800&auto=format&fit=crop', 'drama', 4.9, '12.5k', '150+', N'Quận 1, TP.HCM', N'Biểu tượng văn hóa nghệ thuật cổ điển của Sài Gòn với kiến trúc Pháp rực rỡ.', '212, 175, 55', N'150+ Sự kiện'),
('idecaf', N'Kịch IDECAF', N'Nhà Hát Kịch', N'Sân Khấu', 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=800&auto=format&fit=crop', 'drama', 4.8, '45k', '80+', N'Quận 1, TP.HCM', N'Điểm hẹn sân khấu kịch nghệ lâu đời, mang tính giáo dục và nhân văn sâu sắc.', '255, 94, 98', N'80+ Kịch bản'),
('ha-anh-tuan', N'Hà Anh Tuấn', N'Ca Sĩ', N'Nghệ Sĩ', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=800&auto=format&fit=crop', 'mic', 5.0, '1.2M', '20+', N'Toàn quốc', N'Giọng ca đầy cảm xúc với những chuỗi concert cháy vé mang thương hiệu See Sing Share.', '139, 92, 246', N'20+ Concert'),
('chillies', N'Chillies', N'Ban Nhạc Indie/Pop', N'Nghệ Sĩ', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=800&auto=format&fit=crop', 'music', 4.9, '500k', '50+', N'Toàn quốc', N'Ban nhạc indie pop nổi bật với những giai điệu chữa lành và ca từ đầy tự sự.', '245, 87, 108', N'50+ Show'),
('benthanh', N'Phòng Trà Bến Thành', N'Điểm Hẹn Sân Khấu', N'Sân Khấu', 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=800&auto=format&fit=crop', 'music', 4.7, '8.2k', '200+', N'Quận 1, TP.HCM', N'Không gian ấm cúng kết nối khán giả gần gũi với những giọng ca trữ tình hàng đầu.', '0, 242, 254', N'200+ Đêm nhạc'),
('spacespeakers', N'SpaceSpeakers', N'Hãng Thu Âm / Nghệ Sĩ', N'Nghệ Sĩ', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop', 'headphones', 4.9, '2M+', '30+', N'Toàn quốc', N'Đế chế hip-hop và âm nhạc điện tử định hình xu hướng nghệ thuật đương đại Việt Nam.', '255, 208, 0', N'300M+ Lượt nghe');
GO

INSERT INTO Events (id, title, description, category, date, time, location, priceRange, image, badge, theme, isFeatured, isTrending, creatorId)
VALUES
('rap-viet-2026', N'Rap Việt All-Star Concert 2026', N'Đêm hội hip-hop lớn nhất năm quy tụ dàn huấn luyện viên, giám khảo và các thí sinh xuất sắc nhất các mùa giải của Rap Việt.', 'music', N'24 Tháng 10, 2026', '19:30', N'Sân vận động Quân khu 7, TP.HCM', N'750.000đ - 4.500.000đ', 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1000&auto=format&fit=crop', N'Hot Show', 'dark', 1, 1, 'spacespeakers'),
('ha-anh-tuan-dalat', N'Hà Anh Tuấn Live Concert - Rừng Thông Hát', N'Đêm nhạc đặc biệt trong không gian thơ mộng của rừng thông Đà Lạt, Hà Anh Tuấn cùng các nghệ sĩ khách mời sẽ mang lại những bản tình ca đong đầy cảm xúc.', 'music', N'18 Tháng 11, 2026', '18:00', N'Rừng thông Trại Mát, Đà Lạt', N'1.200.000đ - 5.000.000đ', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop', N'Holographic Ticket', 'slate', 1, 1, 'ha-anh-tuan'),
('les-miserables-musical', N'Nhạc Kịch Những Người Khốn Khổ - Broadway Vietnam', N'Vở nhạc kịch kinh điển Les Misérables được dàn dựng bởi các nghệ sĩ hàng đầu Việt Nam và cố vấn quốc tế, mang lại câu chuyện đầy tính nhân văn.', 'theater', N'05 Tháng 12, 2026', '20:00', N'Nhà hát Lớn Hà Nội, Tràng Tiền', N'500.000đ - 3.000.000đ', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop', N'Classic Play', 'pearl', 1, 1, 'saigon-opera'),
('studio-pass-2026', N'Triển Lãm Nghệ Thuật Đương Đại - Studio Pass 2026', N'Triển lãm trưng bày các tác phẩm hội họa, điêu khắc và sắp đặt kỹ thuật số đa giác quan từ các nghệ sĩ trẻ triển vọng trên khắp đất nước.', 'workshop', N'12 Tháng 10, 2026', '09:00', N'Trung tâm Nghệ thuật Đương đại VCCA, Hà Nội', N'150.000đ - 350.000đ', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1000&auto=format&fit=crop', N'Art Walk', 'dark', 1, 0, NULL),
('vu-bao-tang-liveshow', N'Vũ. Live Concert - Bảo Tàng Của Những Lối Đi', N'Liveshow kỷ niệm chặng đường âm nhạc của "Hoàng tử Indie" Vũ. tại Sài Gòn, nơi kể lại câu chuyện tình yêu qua những bài hát đượm buồn quen thuộc.', 'music', N'28 Tháng 11, 2026', '19:30', N'Nhà thi đấu Phú Thọ, TP.HCM', N'600.000đ - 2.800.000đ', 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=1000&auto=format&fit=crop', N'Selling Fast', 'slate', 1, 1, 'chillies'),
('con-rong-chau-tien', N'Đại Nhạc Hội Văn Hóa - Con Rồng Cháu Tiên', N'Đại nhạc hội trình diễn âm nhạc dân gian đương đại Việt Nam, kết hợp biểu diễn nhạc cụ dân tộc và công nghệ trình chiếu ánh sáng 3D Mapping.', 'music', N'15 Tháng 10, 2026', '19:00', N'Quảng trường Đông Kinh Nghĩa Thục, Hà Nội', N'Miễn phí vé vào cửa', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1000&auto=format&fit=crop', N'Free Access', 'pearl', 1, 0, NULL);
GO

INSERT INTO Zones (id, eventId, name, price, isStanding, availableTickets, [rows], cols)
VALUES
('rap-viet-vip', 'rap-viet-2026', N'Khu Vực VIP President', 4500000, 0, 15, 3, 5),
('rap-viet-standard', 'rap-viet-2026', N'Khu Vực Khán Đài A', 1800000, 0, 48, 6, 8),
('rap-viet-standing', 'rap-viet-2026', N'Khu Vực Đứng GA', 750000, 1, 350, NULL, NULL),
('hat-vip', 'ha-anh-tuan-dalat', N'Hàng Ghế VIP Lộc Vừng', 5000000, 0, 10, 2, 5),
('hat-standard', 'ha-anh-tuan-dalat', N'Hàng Ghế Standard Bồ Đề', 2500000, 0, 36, 4, 9),
('hat-standing', 'ha-anh-tuan-dalat', N'Khu GA Rừng Thông (Đứng)', 1200000, 1, 200, NULL, NULL),
('les-mis-vip', 'les-miserables-musical', N'Khán Phòng VIP Hoàng Gia', 3000000, 0, 8, 2, 4),
('les-mis-standard', 'les-miserables-musical', N'Khán Phòng Standard Lầu 1', 1200000, 0, 40, 5, 8),
('studio-pass-all', 'studio-pass-2026', N'Vé Vào Cổng Triển Lãm', 150000, 1, 500, NULL, NULL),
('vu-vip', 'vu-bao-tang-liveshow', N'Khu VIP Hàng Ghế Đầu', 2800000, 0, 16, 2, 8),
('vu-standard', 'vu-bao-tang-liveshow', N'Khu Standard Khán Đài', 1200000, 0, 60, 6, 10),
('vu-standing', 'vu-bao-tang-liveshow', N'Khu GA Đứng Sân Sân', 600000, 1, 300, NULL, NULL),
('con-rong-free', 'con-rong-chau-tien', N'Đăng Ký Vé Fanzone', 0, 1, 1000, NULL, NULL);
GO

INSERT INTO Bookings (id, userId, eventId, zoneId, count, seats, totalPrice, fullName, email, phone, ticketId, paymentStatus, bookingType)
VALUES
('booking-1', 'user-1', 'rap-viet-2026', 'rap-viet-vip', 2, '["A-1", "A-2"]', 9000000, N'Trần Văn Tuấn', 'tuantran@gmail.com', '0912345678', 'AP-856149', 'Paid', 'primary'),
('booking-2', 'user-2', 'ha-anh-tuan-dalat', 'hat-standard', 1, '["B-4"]', 2500000, N'Lê Thị Ngọc', 'ngocle@yahoo.com', '0901234567', 'AP-412785', 'Paid', 'primary');
GO

INSERT INTO Tickets (id, bookingId, userId, eventId, zoneId, seatNumber, qrCode, status, purchaseType)
VALUES
('ticket-1', 'booking-1', 'user-1', 'rap-viet-2026', 'rap-viet-vip', 'A-1', 'QR-AP-856149-1', 'active', 'primary'),
('ticket-2', 'booking-1', 'user-1', 'rap-viet-2026', 'rap-viet-vip', 'A-2', 'QR-AP-856149-2', 'active', 'primary'),
('ticket-3', 'booking-2', 'user-2', 'ha-anh-tuan-dalat', 'hat-standard', 'B-4', 'QR-AP-412785-1', 'active', 'primary'),
('ticket-resale-1', NULL, 'user-seller-1', 'rap-viet-2026', 'rap-viet-vip', 'A-5', 'QR-AP-NAM999', 'reselling', 'primary'),
('ticket-resale-2', NULL, 'user-seller-2', 'ha-anh-tuan-dalat', 'hat-standard', 'C-8', 'QR-AP-THU888', 'reselling', 'primary'),
('ticket-resale-3', NULL, 'user-seller-3', 'les-miserables-musical', 'les-mis-standard', 'B-12', 'QR-AP-PHUOC777', 'reselling', 'primary');
GO

INSERT INTO ResaleTickets (id, ticketId, eventId, eventTitle, zoneName, seatInfo, originalPrice, resalePrice, sellerId, status)
VALUES
('resale-1', 'ticket-resale-1', 'rap-viet-2026', N'Rap Việt All-Star Concert 2026', N'Khu Vực VIP President', N'Hàng A - Ghế 05', 4500000, 3900000, 'user-seller-1', 'available'),
('resale-2', 'ticket-resale-2', 'ha-anh-tuan-dalat', N'Hà Anh Tuấn Live Concert - Rừng Thông Hát', N'Hàng Ghế Standard Bồ Đề', N'Hàng C - Ghế 08', 2500000, 2200000, 'user-seller-2', 'available'),
('resale-3', 'ticket-resale-3', 'les-miserables-musical', N'Nhạc Kịch Những Người Khốn Khổ - Broadway Vietnam', N'Khán Phòng Standard Lầu 1', N'Hàng B - Ghế 12', 1200000, 950000, 'user-seller-3', 'available');
GO
