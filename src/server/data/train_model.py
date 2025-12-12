import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from pythainlp.tokenize import word_tokenize
import re
import joblib
from pathlib import Path 

# ### <<< [เพิ่มเข้ามา] import ไลบรารีสำหรับ Learning Curve >>> ###
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import learning_curve
from datetime import datetime

# ### <<< [ใหม่] เพิ่ม Imports สำหรับ MongoDB >>> ###
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv
# ### <<< สิ้นสุดส่วนที่เพิ่ม >>> ###


# --- 1. การตั้งค่าและโหลดข้อมูล ---

# 1.1. [คงไว้] หาตำแหน่ง Project Root (สำหรับ *บันทึก* ไฟล์)
print("Locating project root...")
script_path = Path(__file__).resolve()
project_root = None
for parent in script_path.parents:
    if parent.name == 'UDetectionNews':
        project_root = parent
        break

if project_root is None:
    print("❌ Error: Could not find project root 'UDetectionNews'.")
    print("Please ensure the script is running within the 'UDetectionNews' project structure.")
    # ในสคริปต์จริง คุณอาจต้องการ exit() ตรงนี้
else:
    print(f"Project root found at: {project_root}")


# 1.2. [ใหม่] โหลดข้อมูลจาก MongoDB
print("\nLoading data from MongoDB...")
load_dotenv(project_root / '.env') # ระบุ .env ที่ project root
    
DB_USERNAME = os.getenv('DB_USERNAME')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_PROJECT_NAME = os.getenv('DB_PROJECT_NAME')
    
if not all([DB_USERNAME, DB_PASSWORD, DB_PROJECT_NAME]):
    print("❌ Error: Database credentials or DB_NAME not found in .env file.")
    # exit() 

connection_string = f"mongodb+srv://{DB_USERNAME}:{DB_PASSWORD}@{DB_PROJECT_NAME}.0prwqib.mongodb.net/"
COLLECTION_NAME = 'LinkNews' # <-- ชื่อ Collection ที่คุณต้องการ
    
# 1.3. [คงไว้] กำหนดชื่อคอลัมน์
feature_column_name = 'title'
target_column_name = 'category'
    
client = None
df = pd.DataFrame() # สร้าง df ว่างๆ ไว้ก่อน

try:
    print(f"Connecting to MongoDB and fetching '{COLLECTION_NAME}'...")
    client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("✅ MongoDB Connection successful!")
        
    db = client[DB_PROJECT_NAME]
    collection = db[COLLECTION_NAME]

    # ดึงเฉพาะ field ที่เราต้องการ (หัวข้อข่าว, ประเภทข่าว)
    query_projection = {
        feature_column_name: 1,
        target_column_name: 1,
        '_id': 0 # ไม่ต้องเอา _id มา
    }
        
    cursor = collection.find({}, query_projection)
    data_list = list(cursor)
        
    if not data_list:
        print(f"⚠️ Warning: No data found in collection '{COLLECTION_NAME}'.")
    else:
        df = pd.DataFrame(data_list)
        print(f"Successfully loaded {len(df)} documents from MongoDB.")

except (ConnectionFailure, ServerSelectionTimeoutError) as e:
    print(f"❌ Error: Could not connect to MongoDB. {e}")
except Exception as e:
    print(f"❌ An error occurred during MongoDB query: {e}")
finally:
    if client:
        client.close()
        print("MongoDB connection closed.")


# ### <<< [ลบออก] โค้ดส่วนที่อ่านจาก Excel ถูกแทนที่ด้วย MongoDB >>> ###
# file_name = project_root / 'public' / 'AFNC_Opendata_export_20251102151128.xlsx'
# df = pd.read_excel(file_name)
# ### <<< สิ้นสุดส่วนที่ลบออก >>> ###


# 1.4. [คงไว้] Process DataFrame ที่ได้มา (ไม่ว่าจะมาจาก Excel หรือ Mongo)
print("\nProcessing DataFrame...")
df.dropna(subset=[feature_column_name, target_column_name], inplace=True)
classes_to_keep = ['ข่าวจริง', 'ข่าวปลอม']
df = df[df[target_column_name].isin(classes_to_keep)]
print(f"Processed {len(df)} rows ('ข่าวจริง'/'ข่าวปลอม') for training.")
print("-" * 30)


# --- 2. การเตรียมและประมวลผลข้อความ (Text Preprocessing) ---
# (โค้ดส่วนนี้เหมือนเดิม)
def thai_text_processor(text):
    text = re.sub(r'[^\u0E00-\u0E7Fa-zA-Z\s]', '', str(text))
    words = word_tokenize(text, engine='newmm')
    return " ".join(words)

def train_model(penalty='l2', C=1, solver='lbfgs', max_iter=100, class_weight=None, fit_intercept= True, save_picture_name = 'picture_ai.png', save_model_name = "model_ai.joblib", save_report_name = "model_report.txt", save_vector_name = "vector.joblib"): 
    
    # ตรวจสอบก่อนว่า df มีข้อมูลหรือไม่
    if df.empty:
        print("❌ Error: DataFrame is empty. Cannot proceed with training.")
        return

    print("Applying text preprocessing...")
    df['text_processed'] = df[feature_column_name].apply(thai_text_processor)

    # --- 3. การแปลงข้อความเป็นตัวเลข (Vectorization) ---
    print("Vectorizing text data...")
    vectorizer = TfidfVectorizer(max_features=2000)
    X = vectorizer.fit_transform(df['text_processed'])
    y = df[target_column_name]


    # ### <<< [เพิ่มเข้ามา] ส่วนของการสร้าง Learning Curve >>> ###
    # (โค้ดส่วนนี้เหมือนเดิม... ผมขอย่อไว้)
    # ---------------------------------------------------------
    print("\nGenerating Learning Curve...")
    print("(This may take a moment as it involves cross-validation)...")
    lc_model = LogisticRegression(random_state=42, penalty=penalty, C=C, solver=solver, max_iter=max_iter, class_weight=class_weight, fit_intercept= fit_intercept)
    train_sizes_abs, train_scores, test_scores = learning_curve(
        lc_model, X, y, cv=5, scoring='accuracy', n_jobs=-1, 
        train_sizes=np.linspace(0.1, 1.0, 5)
    )
    train_scores_mean = np.mean(train_scores, axis=1)
    train_scores_std = np.std(train_scores, axis=1)
    test_scores_mean = np.mean(test_scores, axis=1)
    test_scores_std = np.std(test_scores, axis=1)

    plt.figure(figsize=(10, 6))
    plt.title("Learning Curve (Logistic Regression)")
    plt.xlabel("Training Dataset News")
    plt.ylabel("Accuracy Score")
    plt.ylim(0, 1.0)
    plt.grid()
    plt.fill_between(train_sizes_abs, train_scores_mean - train_scores_std,
                     train_scores_mean + train_scores_std, alpha=0.1, color="b")
    plt.fill_between(train_sizes_abs, test_scores_mean - test_scores_std,
                     test_scores_mean + test_scores_std, alpha=0.1, color="g")
    plt.plot(train_sizes_abs, train_scores_mean, 'o-', color="b", label="Training score")
    plt.plot(train_sizes_abs, test_scores_mean, 'o-', color="g", label="Cross-validation score")
    plt.legend(loc="best")

    # [สำคัญ] ตรวจสอบว่า project_root ถูกตั้งค่าแล้วก่อนบันทึก
    if project_root:
        save_path = project_root / 'public' / save_picture_name
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"Learning Curve plot saved to: {save_path}")
    else:
        print("⚠️ Warning: Could not save learning curve plot. Project root not found.")
        
    print("-" * 30)
    # ### <<< สิ้นสุดส่วนที่เพิ่มเข้ามา >>> ###


    # --- 4. การแบ่งข้อมูลสำหรับ Train และ Test ---
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)
    print(f"Training set size: {X_train.shape[0]}")
    print(f"Test set size: {X_test.shape[0]}")
    print("-" * 30)


    # --- 5. การสร้างและเทรนโมเดล Logistic Regression ---
    print("Training Logistic Regression model...")
    model = LogisticRegression(random_state=42, penalty=penalty, C=C, solver=solver, max_iter=max_iter, class_weight=class_weight, fit_intercept= fit_intercept)
    model.fit(X_train, y_train)
    print("Model trained successfully!")
    print("-" * 30)


    # --- 5.1 การบันทึกโมเดล --- 
    # [สำคัญ] ตรวจสอบว่า project_root ถูกตั้งค่าแล้วก่อนบันทึก
    if project_root:
        save_model_path = project_root / 'public'/ save_model_name
        save_vectorizer_path = project_root / 'public'/ save_vector_name

        joblib.dump(model, save_model_path)
        joblib.dump(vectorizer, save_vectorizer_path)
        print(f"Model saved to '{save_model_name}'")
        print(f"Vectorizer saved to '{save_vector_name}'")
    else:
        print("⚠️ Warning: Could not save model/vectorizer. Project root not found.")
    print("-" * 30)


    # --- 6. การประเมินผลโมเดล ---
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy on Test Set: {accuracy:.4f}")
    print("\nClassification Report (Text):")
    report_text = classification_report(y_test, y_pred, 
                                        labels=classes_to_keep, 
                                        target_names=classes_to_keep)
    print(report_text)


    # ### <<< [เพิ่มเข้ามา] ส่วนของการบันทึก Report เป็น .txt >>> ###
    print("\nSaving evaluation report to text file...")
    
    # [สำคัญ] ตรวจสอบว่า project_root ถูกตั้งค่าแล้วก่อนบันทึก
    if not project_root:
        print("⚠️ Warning: Could not save report file. Project root not found.")
        return # ออกจากฟังก์ชันถ้าบันทึก report ไม่ได้

    try:
        report_path = project_root / 'public' / save_report_name
        report_path.parent.mkdir(parents=True, exist_ok=True)
        cm = confusion_matrix(y_test, y_pred, labels=classes_to_keep)

        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(f"--- Model Evaluation Report ---\n")
            f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("-" * 30 + "\n\n")

            f.write("--- Overall Performance ---\n")
            f.write(f"Accuracy: {accuracy:.4f}\n\n")

            f.write("--- Per-Class Performance (on Test Set) ---\n")
            for i, class_name in enumerate(classes_to_keep):
                total_correct = cm[i][i]
                total_in_test = cm[i].sum()
                f.write(f"Class: '{class_name}'\n")
                f.write(f"  - Total in Test Set: {total_in_test}\n")
                f.write(f"  - Correctly Predicted: {total_correct}\n")
            f.write("\n")

            f.write("--- Model Hyperparameters (Logistic Regression) ---\n")
            params = model.get_params()
            for key, value in params.items():
                f.write(f"  - {key}: {value}\n")
            f.write("\n")
            
            f.write("--- Full Classification Report (Text) ---\n")
            f.write(report_text)
            f.write("\n")

        print(f"✅ Report saved successfully to: {report_path}")

    except Exception as e:
        print(f"⛔ Error saving report file: {e}")
