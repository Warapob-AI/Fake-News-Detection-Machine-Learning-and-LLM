import requests
import json

# URL ของ Webhook ที่คุณให้มา
webhook_url = "http://localhost:5678/webhook-test/2f39aea5-cccb-46c3-a7cb-cebf4b053b07"

# ข้อมูลที่จะส่งไป (ปรับเปลี่ยนตามต้องการ)
payload = {
    "title": "ทดสอบส่งข้อมูลจาก Python",
    "content": "เนื้อหาข่าวหรือข้อมูลที่ต้องการส่ง...",
    "category": "Technology"
}

try:
    # ส่งข้อมูลแบบ POST (ส่งเป็น JSON)
    response = requests.post(webhook_url, json=payload)

    # เช็คผลลัพธ์
    if response.status_code == 200:
        print("✅ ส่งข้อมูลสำเร็จ:", response.text)
    else:
        print(f"❌ เกิดข้อผิดพลาด (Status {response.status_code}):", response.text)

except Exception as e:
    print(f"❌ เชื่อมต่อไม่ได้: {e}")