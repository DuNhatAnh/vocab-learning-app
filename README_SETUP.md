# Hướng dẫn Thiết lập Tài nguyên

Để ứng dụng có thể chạy được, bạn cần cung cấp hai thành phần quan trọng:

## 1. Firebase Service Account Key
1. Truy cập [Firebase Console](https://console.firebase.google.com/).
2. Chọn dự án của bạn.
3. Vào **Project Settings** > **Service Accounts**.
4. Nhấn **Generate new private key**.
5. Lưu file tải về với tên là `serviceAccountKey.json` vào thư mục `backend/` của dự án.
   - *Lưu ý: Đừng chia sẻ file này cho bất kỳ ai.*

## 2. Vosk Speech Model
1. Tải model ngôn ngữ (ví dụ: `vosk-model-small-en-us-0.15`) từ [Vosk Models](https://alphacephei.com/vosk/models).
2. Giải nén và đổi tên thư mục thành `model`.
3. Di chuyển thư mục `model` vào `backend/src/main/resources/`.
   - Đường dẫn đầy đủ sẽ là: `backend/src/main/resources/model/` (bên trong chứa các file như `am/`, `conf/`, ...).

## 3. Chạy ứng dụng với Docker
Sau khi đã chuẩn bị xong các file trên, bạn chỉ cần chạy:
```bash
docker-compose up --build
```
Hệ thống sẽ tự động mount các file này vào container nhờ vào các thay đổi trong `docker-compose.yml`.
