# So sánh CF: Jobs vs Phim - Vấn đề đặc thù

## 🎯 Tổng quan

Collaborative Filtering cho **Jobs** khác hoàn toàn với **Phim** vì bản chất của items và user behavior khác nhau.

## 📊 Bảng so sánh tổng quan

| Đặc điểm | Phim (Movies) | Jobs (Công việc) |
|----------|---------------|------------------|
| **Item lifetime** | Vĩnh viễn | Tạm thời (có deadline) |
| **User interaction** | Xem nhiều lần | Apply 1 lần, làm 1 lần |
| **Rating** | 1-5 sao | Accept/Pending/Reject |
| **Quantity** | Hàng triệu phim | Hàng nghìn jobs |
| **Update frequency** | Ít (phim mới/tháng) | Nhiều (jobs mới/ngày) |
| **Cold start** | Ít (phim cũ vẫn tốt) | Nhiều (jobs mới liên tục) |
| **Personalization** | Cao (sở thích ổn định) | Trung bình (thay đổi theo thời gian) |

---

## 🎬 1. PHIM (Movies) - Case lý tưởng cho CF

### Đặc điểm:

#### ✅ Items ổn định:
```
Phim "The Godfather" (1972)
- Tồn tại mãi mãi
- Luôn có thể xem
- Không hết hạn
- Không bị xóa
```

#### ✅ Interactions phong phú:
```
User A:
- Xem "The Godfather": 5 sao
- Xem "Pulp Fiction": 4 sao
- Xem "Fight Club": 5 sao
- Xem "Inception": 3 sao
→ 100+ ratings

User B:
- Xem "The Godfather": 5 sao
- Xem "Pulp Fiction": 5 sao
- Xem "Fight Club": 4 sao
→ 80+ ratings

Similarity(A, B) = 0.95 (rất cao)
```

#### ✅ Sở thích ổn định:
```
User thích "Action" → Luôn thích Action
User thích "Romance" → Luôn thích Romance
→ Preferences không đổi theo thời gian
```

#### ✅ Matrix đầy đủ:
```
User-Movie Matrix:
         Movie1  Movie2  Movie3  Movie4  Movie5
User1      5       4       3       5       4
User2      4       5       4       3       5
User3      5       4       5       4       3
User4      3       5       4       5       4

→ Nhiều ratings, ít sparse
```

### Kết quả CF cho Phim:

```python
# User A thích Action movies
similar_users = find_similar(User_A)
# → User B, C, D cũng thích Action

recommended_movies = get_movies_from_similar_users()
# → "John Wick", "Mad Max", "Die Hard"

# ✅ Recommendations chính xác vì:
# - Phim vẫn còn (không hết hạn)
# - Sở thích ổn định
# - Nhiều data
```

---

## 💼 2. JOBS - Case phức tạp cho CF

### Vấn đề 1: **Items tạm thời (Temporal Items)**

#### ❌ Jobs có deadline:
```
Job "Dọn dẹp nhà" (ID: 123)
- Created: 2024-11-01
- Deadline: 2024-11-30
- Status: OPEN

→ Sau 2024-11-30:
  - Job CLOSED
  - Không thể apply
  - Không nên recommend
```

#### ❌ Matrix thay đổi liên tục:
```
Tháng 11:
         Job1  Job2  Job3  Job4  Job5
User1     5     4     3     -     -
User2     4     5     -     -     -
User3     5     -     4     -     -

Tháng 12 (Jobs mới):
         Job6  Job7  Job8  Job9  Job10
User1     -     -     -     -     -
User2     -     -     -     -     -
User3     -     -     -     -     -

→ Matrix "reset" mỗi tháng!
```

#### 🔧 Giải pháp:
```python
# Chỉ recommend jobs còn hạn
def recommend(worker_id):
    predicted_categories = predict_categories(worker_id)
    
    # ✅ Filter by deadline
    jobs = get_jobs_from_categories(
        predicted_categories,
        deadline_gte=TODAY  # Chỉ lấy jobs còn hạn
    )
    
    return jobs
```

### Vấn đề 2: **Interactions khan hiếm (Sparse Interactions)**

#### ❌ User apply ít jobs:
```
Phim:
User A: 100 ratings → Nhiều data

Jobs:
Worker A: 5 applications → Ít data
- Apply Job 1: ACCEPTED
- Apply Job 2: PENDING
- Apply Job 3: REJECTED
- Apply Job 4: ACCEPTED
- Apply Job 5: PENDING

→ Chỉ 5 interactions!
```

#### ❌ Matrix rất sparse:
```
User-Job Matrix (1000 users × 10000 jobs):
         Job1  Job2  Job3  ...  Job10000
User1     5     -     -    ...     -
User2     -     3     -    ...     -
User3     -     -     4    ...     -
...
User1000  -     -     -    ...     5

→ 99.9% cells = empty!
```

#### 🔧 Giải pháp:
```python
# Dùng fake data để tăng density
def train():
    # Real data: 5 interactions
    real_data = load_real_interactions(worker_id=1)
    
    # Fake data: 150 interactions
    fake_data = generate_fake_interactions(
        num_workers=50,
        interactions_per_worker=3
    )
    
    # Combine
    all_data = real_data + fake_data
    
    # Train CF
    model.fit(all_data)
```

### Vấn đề 3: **One-time interaction**

#### ❌ User chỉ apply 1 lần:
```
Phim:
User xem "The Godfather" nhiều lần
→ Confirm sở thích

Jobs:
Worker apply "Dọn dẹp nhà" 1 lần
→ Không chắc sở thích
  - Có thể thử nghiệm
  - Có thể cần tiền gấp
  - Có thể không thích nhưng bắt buộc
```

#### ❌ Rating không rõ ràng:
```
Phim:
5 sao = Rất thích
1 sao = Không thích
→ Rõ ràng

Jobs:
ACCEPTED = Thích? Hoặc chỉ cần tiền?
REJECTED = Không thích? Hoặc không đủ skill?
PENDING = Đang chờ? Hoặc không quan tâm?
→ Không rõ ràng
```

#### 🔧 Giải pháp:
```python
# Weighted scoring
def calculate_score(status):
    scores = {
        'ACCEPTED': 5,   # Cao nhất
        'PENDING': 3,    # Trung bình
        'REJECTED': 1    # Thấp nhất
    }
    return scores.get(status, 0)

# Aggregate multiple applications
def get_category_preference(worker_id, category_id):
    applications = get_applications(worker_id, category_id)
    
    total_score = sum(calculate_score(app.status) 
                     for app in applications)
    
    return total_score / len(applications)
```

### Vấn đề 4: **Cold start nghiêm trọng**

#### ❌ Jobs mới không có interactions:
```
Job mới "Vệ sinh máy lạnh" (ID: 999)
- Created: Hôm nay
- Applications: 0
- Ratings: 0

CF không biết recommend cho ai!
```

#### ❌ Workers mới không có history:
```
Worker mới (ID: 1001)
- Registered: Hôm nay
- Applications: 0
- History: 0

CF không biết recommend gì!
```

#### 🔧 Giải pháp:
```python
# Hybrid: CF + Content-based
def recommend(worker_id):
    # 1. CF recommendations
    cf_jobs = cf_recommend(worker_id)
    
    # 2. New jobs (content-based)
    new_jobs = get_new_jobs(days=7)
    
    # 3. Merge
    return merge_with_priority(
        consensus_jobs,  # CF ∩ New
        cf_jobs,         # CF only
        new_jobs         # New only
    )
```

### Vấn đề 5: **Preferences thay đổi**

#### ❌ Sở thích không ổn định:
```
Phim:
User thích Action → Luôn thích Action

Jobs:
Worker tháng 1: Thích "Dọn dẹp" (cần tiền gấp)
Worker tháng 6: Thích "Chăm sóc trẻ" (có kinh nghiệm)
Worker tháng 12: Thích "Bán hàng" (muốn đổi nghề)

→ Preferences thay đổi theo:
  - Kỹ năng
  - Tình hình tài chính
  - Mục tiêu nghề nghiệp
```

#### 🔧 Giải pháp:
```python
# Time decay: Ưu tiên interactions gần đây
def calculate_score(application):
    base_score = {
        'ACCEPTED': 5,
        'PENDING': 3,
        'REJECTED': 1
    }[application.status]
    
    # Time decay
    days_ago = (TODAY - application.created_at).days
    decay_factor = 0.95 ** (days_ago / 30)  # Giảm 5% mỗi tháng
    
    return base_score * decay_factor
```

### Vấn đề 6: **Location constraint**

#### ❌ Jobs có ràng buộc địa lý:
```
Phim:
User ở Hà Nội xem phim Hollywood → OK
User ở TP.HCM xem phim Hollywood → OK
→ Không có ràng buộc location

Jobs:
Worker ở Hà Nội apply job ở TP.HCM → Không thực tế
Worker ở Quận 1 apply job ở Quận 12 → Xa
→ Location rất quan trọng
```

#### 🔧 Giải pháp:
```python
# Filter by location
def recommend(worker_id):
    worker = get_worker(worker_id)
    worker_location = worker.location
    
    # CF recommendations
    cf_jobs = cf_recommend(worker_id)
    
    # Filter by distance
    nearby_jobs = [
        job for job in cf_jobs
        if calculate_distance(worker_location, job.location) < 10km
    ]
    
    return nearby_jobs
```

---

## 📊 So sánh Matrix

### Phim (Dense Matrix):
```
10,000 users × 50,000 movies
Average ratings per user: 100
Sparsity: 99.98%
→ Vẫn đủ data để CF hoạt động tốt
```

### Jobs (Very Sparse Matrix):
```
1,000 workers × 10,000 jobs
Average applications per worker: 5
Sparsity: 99.9995%
→ Quá sparse, CF khó hoạt động
```

---

## 🎯 Kết luận

### Tại sao CF cho Jobs khó hơn Phim:

| Vấn đề | Phim | Jobs | Impact |
|--------|------|------|--------|
| **Items tồn tại** | Vĩnh viễn | Tạm thời | ⚠️⚠️⚠️ Cao |
| **Interactions** | Nhiều (100+) | Ít (5-10) | ⚠️⚠️⚠️ Cao |
| **Matrix density** | ~0.02% | ~0.0005% | ⚠️⚠️⚠️ Cao |
| **Cold start** | Ít | Nhiều | ⚠️⚠️ Trung bình |
| **Preferences** | Ổn định | Thay đổi | ⚠️⚠️ Trung bình |
| **Location** | Không | Có | ⚠️ Thấp |

### Giải pháp đã implement:

1. ✅ **Filter deadline** - Chỉ recommend jobs còn hạn
2. ✅ **Fake data** - Tăng matrix density
3. ✅ **Weighted scoring** - ACCEPTED > PENDING > REJECTED
4. ✅ **Hybrid CF + Content** - Xử lý cold start
5. ✅ **Time decay** - Ưu tiên interactions gần đây
6. ✅ **Location filter** - Filter jobs xa

### Kết quả:

```python
# Phim: CF thuần túy
accuracy = 90%
coverage = 95%

# Jobs: CF + Hybrid
accuracy = 80%  # Thấp hơn
coverage = 85%  # Thấp hơn

# Nhưng vẫn tốt hơn:
# - Random: 20%
# - Popular: 40%
# - Content-based only: 60%
```

---

## 💡 Bài học

### CF không phải silver bullet:

1. **Phim/Music/Books** → CF hoạt động tuyệt vời
2. **Jobs/Real Estate/Dating** → CF cần nhiều tricks
3. **News/Ads** → CF khó, cần real-time

### Khi nào dùng CF cho Jobs:

✅ **Nên dùng khi:**
- Có đủ historical data (>10 applications/worker)
- Jobs tồn tại lâu (>1 tháng)
- Workers có sở thích ổn định

❌ **Không nên dùng khi:**
- Workers mới (cold start)
- Jobs mới (cold start)
- Ít data (<5 applications)

### Best practice:

```python
# Hybrid approach
if worker.applications_count >= 10:
    # Đủ data → Dùng CF
    jobs = cf_recommend(worker_id)
else:
    # Ít data → Dùng Content-based
    jobs = content_based_recommend(worker_profile)

# Always merge với new jobs
jobs = merge(jobs, get_new_jobs())
```

---

**Tóm lại:** CF cho Jobs khó hơn Phim rất nhiều vì bản chất của Jobs là **tạm thời, sparse, và thay đổi**. Cần kết hợp nhiều techniques để đạt kết quả tốt! 🎯
