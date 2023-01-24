/*นี่คือสคริปต์ฝั่งเซิร์ฟเวอร์ Node.js ที่ใช้
 ไลบรารี Express และ Socket.io เพื่อสร้างแบบเรียลไทม์
 แอปพลิเคชั่นวิดีโอแชท WebRTC */         
 

 /**
 * บรรทัดเหล่านี้นำเข้าไลบรารี Express และ uuid, 
 * และสร้างอินสแตนซ์ของแอปพลิเคชัน Express และเซิร์ฟเวอร์ HTTP.    
 */
const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");

/**
 * บรรทัดนี้นำเข้าโมดูล ExpressPeerServer จากไลบรารีเพียร์, 
 * และบรรทัดถัดไปสร้างออบเจกต์อ็อพชันที่มีคุณสมบัติการดีบัก 
 * ตั้งค่าเป็นจริง    
 *     
 */
const { ExpressPeerServer } = require("peer");
const opinions = {
    debug: true,
}

/**
 * บรรทัดนี้ตั้งค่ากลไกการดูสำหรับแอปพลิเคชัน Express เป็น EJS, 
 * และบรรทัดถัดไปนำเข้าไลบรารี Socket.io 
 * และแนบกับเซิร์ฟเวอร์ HTTP. 
 * คุณสมบัติ cors ใช้เพื่ออนุญาตการเชื่อมต่อจากต้นทางใดๆ.
 */
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

/**
 * บรรทัดเหล่านี้ติดตั้งมิดเดิลแวร์ ExpressPeerServer บนเส้นทาง /peerjs 
 * และให้บริการเนื้อหาของไดเร็กทอรีสาธารณะเป็นสินทรัพย์คงที่.
 */

app.use("/peerjs", ExpressPeerServer(server, opinions));
app.use(express.static("public"));


/**
 * รหัสนี้สร้างเส้นทางสำหรับ URL รูทและ
 * เปลี่ยนเส้นทางผู้ใช้ไปยังรหัสห้องที่สร้างขึ้นแบบสุ่ม 
 * สร้างโดย uuidv4()
 */

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});


/**
 * รหัสนี้สร้างเส้นทางสำหรับ URL ด้วยพารามิเตอร์ห้อง 
 * และแสดงมุมมอง room.ejs ด้วยพารามิเตอร์ roomId ที่ส่งผ่านเข้ามา.
 */

app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
});



/**
 * รหัสนี้รับฟังเหตุการณ์ "การเชื่อมต่อ" จากลูกค้า, 
 * และเมื่อไคลเอนต์เชื่อมต่อก็จะฟังเหตุการณ์ "เข้าร่วมห้อง" 
 * และเข้าร่วมห้องด้วย roomId ที่แน่นอน
 * นอกจากนี้ยังปล่อยเหตุการณ์ "เชื่อมต่อกับผู้ใช้" ด้วย userId บางอย่าง 
 * หลังจาก 1 วินาที นอกจากนี้ยังฟังเหตุการณ์ "ข้อความ", 
 * และเมื่อได้รับข้อความ, 
 * มันส่งข้อความและชื่อผู้ใช้ไปยังไคลเอนต์ทั้งหมดในห้อง
 */
io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        setTimeout(() => {
            socket.to(roomId).broadcast.emit("user-connected", userId);
        }, 1000)
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

/**บรรทัดนี้เริ่มต้นเซิร์ฟเวอร์และ
 * ฟังพอร์ตที่ระบุใน 
 * ตัวแปรสภาพแวดล้อม PORT หรือพอร์ต 3030 หากไม่ได้ตั้งค่าไว้ */
server.listen(process.env.PORT || 3030);

