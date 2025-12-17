# ไฟล์ main.py

from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List
import joblib
import re
from pythainlp.tokenize import word_tokenize
import trafilatura
from concurrent.futures import ThreadPoolExecutor
import json
import sys


# สร้าง App
app = FastAPI()

# ==========================================
# ส่วนที่ 1: เตรียมฟังก์ชันสำหรับ AI
# ==========================================

# 1. ฟังก์ชันตัดคำภาษาไทย
def thai_text_processor(text):
    text = re.sub(r'[^\u0E00-\u0E7Fa-zA-Z\s]', '', str(text))
    words = word_tokenize(text, engine='newmm')
    return " ".join(words)

def split_tokenizer(text):
    return text.split()

import __main__
# ❌ ของเดิม: setattr(__main__, "split_tokenizer", split_tokenizer)
# ✅ แก้เป็น: ใช้ชื่อ "my_tokenizer" เพื่อหลอก Model ว่านี่คือฟังก์ชันเดิม
setattr(__main__, "my_tokenizer", split_tokenizer)

# ==========================================
# ส่วนที่ 2: โหลดโมเดล AI
# ==========================================
print("Loading AI models...")
model = None
vectorizer = None

try:
    model = joblib.load("model_ai.joblib")
    vectorizer = joblib.load("vector.joblib")
    print("✅ AI Models loaded successfully!")
except Exception as e:
    print(f"⚠️ Warning: Model files not found or error loading. ({e})")


# Class สำหรับรับ Input ทำนายข่าว
class NewsRequest(BaseModel):
    headline: str
    
@app.post("/predict")
def predict(request: NewsRequest):
    # print("🔄 เข้ามาที่ Predict") 
    if not model or not vectorizer:
        raise HTTPException(status_code=500, detail="Model is not loaded.")
    
    try:
        processed_headline = thai_text_processor(request.headline)
        # แปลงข้อความโดยใช้ vectorizer ตัวเดียวกับที่เทรนมา
        vectorized_headline = vectorizer.transform([processed_headline])
        
        # ทำนายผล (จะได้ออกมาเป็น 0 หรือ 1)
        prediction = model.predict(vectorized_headline)[0]
        prob_list = model.predict_proba(vectorized_headline)[0]
        confidence = max(prob_list) * 100
        
        # ✅ ส่วนที่เพิ่ม: แปลง 0/1 เป็นข้อความ
        # (ถ้าผลออกมาสลับกัน ให้มาแก้ตรงนี้ครับ เช่นเปลี่ยน 1 เป็นข่าวปลอม แทน)
        if str(prediction) == "1":
            result_text = "ข่าวจริง"
        else:
            result_text = "ข่าวปลอม"

        return {
            "prediction": result_text,       # ส่งคืนเป็นข้อความที่อ่านรู้เรื่องแล้ว
            "confidence": f"{confidence:.2f}",
            "processed_text": processed_headline,
            "raw_value": str(prediction)     # (แถม) ส่งค่าดิบ 0/1 ไปด้วยเผื่อใช้ debug
        }
    except Exception as e:
        print(f"Error prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# ส่วนที่ 3: ระบบดูดเนื้อหาข่าว
# ==========================================
class ScrapeRequest(BaseModel):
    urls: list[str]

def fetch_url_data(url):
    result_data = {
        "link": url,
        "title": "ไม่สามารถโหลดข้อมูลได้",
        "description": "No content found",
        "imageUrl": "",
        "content": ""
    }
    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            extracted_json = trafilatura.extract(
                downloaded, include_images=True, include_comments=False, 
                output_format="json", with_metadata=True
            )
            if extracted_json:
                data = json.loads(extracted_json)
                title = data.get("title") or "ไม่มีชื่อเรื่อง"
                full_text = data.get("text") or ""
                excerpt = data.get("excerpt") or (full_text[:300] + "..." if full_text else "ไม่มีเนื้อหา")
                image = data.get("image") or ""
                
                result_data.update({
                    "title": title,
                    "description": excerpt,
                    "imageUrl": image,
                    "content": full_text
                })
    except Exception as e:
        print(f"Error scrapping {url}: {e}")
        result_data["description"] = f"Error: {str(e)}"

    return result_data

def fetch_url_title(url):
    # ตั้งค่า Default ไว้ก่อน
    result_data = {
        "title": "ไม่สามารถโหลดข้อมูลได้"
    }
    
    try:
        downloaded = trafilatura.fetch_url(url)
        
        if downloaded:
            # เปลี่ยนจาก .extract เป็น .bare_extraction
            # ฟังก์ชันนี้คืนค่าเป็น Python Dict โดยตรง ไม่ต้องเสียเวลาแปลง JSON
            data = trafilatura.bare_extraction(
                downloaded, 
                with_metadata=True, 
                include_comments=False
            )
            
            if data:
                # ดึง title จาก Dict ได้เลย
                title = data.get("title")
                
                # เช็คอีกรอบว่า title ไม่เป็นค่าว่าง
                if title:
                    result_data["title"] = title
                else:
                    result_data["title"] = "ไม่มีชื่อเรื่อง (หาไม่เจอ)"
            else:
                 # กรณีโหลด HTML ได้ แต่แกะข้อมูลไม่ได้เลย
                 result_data["title"] = "แกะข้อมูลไม่ได้ (Structure error)"

    except Exception as e:
        print(f"Error scrapping {url}: {e}")
        result_data["title"] = f"Error: {str(e)}"

    return result_data


@app.post("/scrape-news")
def scrape_news(request: ScrapeRequest):
    with ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(fetch_url_data, request.urls))
    return {"array": results}


# ==========================================
# ส่วนที่ 3: ระบบดูดเนื้อหาข่าว
# ==========================================
class ScrapeTitleRequest(BaseModel):
    urls: list[str]

@app.post("/scrape-title")
def scrape_title(request: ScrapeTitleRequest):
    with ThreadPoolExecutor(max_workers=5) as executor:
        results = list(executor.map(fetch_url_title, request.urls))
    return {"array": results}

@app.get("/")
def health_check():
    return {"status": "API is running", "features": ["predict", "scrape-news", "retrain"]}