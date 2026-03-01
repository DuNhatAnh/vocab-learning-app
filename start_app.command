#!/bin/bash

# Thư mục gốc của dự án
PROJECT_DIR="/Users/dunhatanh/Desktop/English v2/vocab-learning-app"

cd "$PROJECT_DIR"

# Kiểm tra xem Docker có đang chạy không
if ! docker info >/dev/null 2>&1; then
    echo "Đang khởi động Docker Desktop..."
    open -a "Docker"
    # Đợi Docker khởi động xong
    while ! docker info >/dev/null 2>&1; do
        sleep 1
    done
fi

# Khởi động các container ở chế độ chạy ngầm
docker-compose up -d

# Đợi một chút để frontend sẵn sàng
sleep 2

# Mở ứng dụng trên trình duyệt mặc định
open "http://localhost:5173"
