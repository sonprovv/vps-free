# Worker Action Tracking - Examples & Scenarios

## 📊 Scenarios Thực Tế

### Scenario 1: Healthcare Job (Chỉ 1 Worker)

#### Tình huống:
User tạo 1 healthcare job cần chăm sóc người già

#### Flow:
```
1. User tạo job → healthcareJobs collection
   {
     jobID: "HC001",
     serviceType: "HEALTHCARE",
     status: "Hiring",
     acceptCount: 0,
     completeCount: 0
   }

2. Worker A xem job → Log view
   POST /job-actions/worker/view
   → worker_actions: { workerID: "A", jobID: "HC001", actionType: "view" }

3. Worker A check xem job đã full chưa
   GET /job-actions/job/HC001/accepted-count?serviceType=HEALTHCARE
   → Response: { acceptedWorkers: 0, maxWorkers: 1, isFull: false }

4. Worker A accept job ✅
   POST /job-actions/worker/accept
   → acceptCount: 1
   → worker_actions: { workerID: "A", jobID: "HC001", actionType: "accept" }

5. Worker B cũng muốn accept job
   POST /job-actions/worker/accept
   → Response 400: "Healthcare job already has 1 worker" ❌

6. Worker A hoàn thành job
   POST /job-actions/worker/complete
   → completeCount: 1
   → worker_actions: { workerID: "A", jobID: "HC001", actionType: "complete" }

Final State:
{
  jobID: "HC001",
  acceptCount: 1,
  completeCount: 1,
  status: "Completed"
}
```

---

### Scenario 2: Cleaning Job (Nhiều Workers)

#### Tình huống:
User tạo 1 cleaning job dọn dẹp nhà lớn, cần nhiều người

#### Flow:
```
1. User tạo job → cleaningJobs collection
   {
     jobID: "CL001",
     serviceType: "CLEANING",
     status: "Hiring",
     acceptCount: 0,
     completeCount: 0
   }

2. Worker A accept job ✅
   POST /job-actions/worker/accept
   → acceptCount: 1

3. Worker B cũng accept job ✅
   POST /job-actions/worker/accept
   → acceptCount: 2

4. Worker C cũng accept job ✅
   POST /job-actions/worker/accept
   → acceptCount: 3

5. Worker A hoàn thành phần việc của mình
   POST /job-actions/worker/complete
   → completeCount: 1

6. Worker B hoàn thành phần việc của mình
   POST /job-actions/worker/complete
   → completeCount: 2

7. Worker C hoàn thành phần việc của mình
   POST /job-actions/worker/complete
   → completeCount: 3

Final State:
{
  jobID: "CL001",
  acceptCount: 3,
  completeCount: 3,
  status: "Completed"
}
```

---

### Scenario 3: Maintenance Job (Nhiều Workers)

#### Tình huống:
User cần sửa chữa nhiều thiết bị trong nhà

#### Flow:
```
1. User tạo job → maintenanceJobs collection
   {
     jobID: "MT001",
     serviceType: "MAINTENANCE",
     status: "Hiring",
     acceptCount: 0,
     completeCount: 0
   }

2. Worker A (thợ điện) accept job ✅
   POST /job-actions/worker/accept
   → acceptCount: 1

3. Worker B (thợ nước) accept job ✅
   POST /job-actions/worker/accept
   → acceptCount: 2

4. Worker A hoàn thành sửa điện
   POST /job-actions/worker/complete
   → completeCount: 1

5. Worker B hoàn thành sửa nước
   POST /job-actions/worker/complete
   → completeCount: 2

Final State:
{
  jobID: "MT001",
  acceptCount: 2,
  completeCount: 2,
  status: "Completed"
}
```

---

## 💻 Code Examples

### Example 1: Worker App - Accept Job với Validation

```javascript
class WorkerJobService {
  constructor(token) {
    this.token = token;
    this.baseURL = 'https://api.example.com/job-actions';
  }

  async acceptJob(jobID, serviceType) {
    try {
      // Step 1: Check if can accept (especially for HEALTHCARE)
      if (serviceType === 'HEALTHCARE') {
        const canAccept = await this.checkJobAvailability(jobID, serviceType);
        if (!canAccept) {
          throw new Error('Job này đã có worker accept rồi');
        }
      }

      // Step 2: Accept job
      const response = await fetch(`${this.baseURL}/worker/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobID, serviceType })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      return {
        success: true,
        message: 'Accept job thành công!',
        acceptLimit: result.data.acceptLimit
      };

    } catch (error) {
      console.error('Error accepting job:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  async checkJobAvailability(jobID, serviceType) {
    const response = await fetch(
      `${this.baseURL}/job/${jobID}/accepted-count?serviceType=${serviceType}`,
      {
        headers: { 'Authorization': `Bearer ${this.token}` }
      }
    );

    const result = await response.json();
    return !result.data.isFull;
  }

  async completeJob(jobID, serviceType) {
    const response = await fetch(`${this.baseURL}/worker/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jobID, serviceType })
    });

    return await response.json();
  }

  async getMyAcceptedJobs() {
    const response = await fetch(
      `${this.baseURL}/worker/actions?actionType=accept&limit=20`,
      {
        headers: { 'Authorization': `Bearer ${this.token}` }
      }
    );

    const result = await response.json();
    return result.data.actions;
  }
}

// Usage
const workerService = new WorkerJobService(workerToken);

// Accept healthcare job
const result = await workerService.acceptJob('HC001', 'HEALTHCARE');
if (result.success) {
  console.log('✅', result.message);
} else {
  console.log('❌', result.message);
}

// Complete job
await workerService.completeJob('HC001', 'HEALTHCARE');

// Get my accepted jobs
const myJobs = await workerService.getMyAcceptedJobs();
console.log(`Tôi đã accept ${myJobs.length} jobs`);
```

---

### Example 2: Admin Dashboard - Job Statistics

```javascript
class AdminJobAnalytics {
  constructor(token) {
    this.token = token;
    this.baseURL = 'https://api.example.com/job-actions';
  }

  async getJobStats(jobID, serviceType) {
    // Get job details
    const jobResponse = await fetch(
      `${this.baseURL}/job/${jobID}?serviceType=${serviceType}`,
      {
        headers: { 'Authorization': `Bearer ${this.token}` }
      }
    );
    const job = await jobResponse.json();

    // Get accepted workers count
    const countResponse = await fetch(
      `${this.baseURL}/job/${jobID}/accepted-count?serviceType=${serviceType}`,
      {
        headers: { 'Authorization': `Bearer ${this.token}` }
      }
    );
    const countData = await countResponse.json();

    return {
      jobID,
      serviceType,
      acceptCount: job.data.job.acceptCount || 0,
      completeCount: job.data.job.completeCount || 0,
      acceptedWorkers: countData.data.acceptedWorkers,
      maxWorkers: countData.data.maxWorkers,
      isFull: countData.data.isFull,
      completionRate: this.calculateCompletionRate(
        job.data.job.completeCount,
        job.data.job.acceptCount
      )
    };
  }

  calculateCompletionRate(completed, accepted) {
    if (accepted === 0) return 0;
    return ((completed / accepted) * 100).toFixed(2);
  }

  async getServiceTypeStats(serviceType) {
    const response = await fetch(
      `${this.baseURL}/jobs/${serviceType}?limit=100`,
      {
        headers: { 'Authorization': `Bearer ${this.token}` }
      }
    );

    const result = await response.json();
    const jobs = result.data.jobs;

    const stats = {
      totalJobs: jobs.length,
      totalAccepts: 0,
      totalCompletes: 0,
      avgAcceptsPerJob: 0,
      avgCompletesPerJob: 0
    };

    jobs.forEach(job => {
      stats.totalAccepts += job.acceptCount || 0;
      stats.totalCompletes += job.completeCount || 0;
    });

    stats.avgAcceptsPerJob = (stats.totalAccepts / stats.totalJobs).toFixed(2);
    stats.avgCompletesPerJob = (stats.totalCompletes / stats.totalJobs).toFixed(2);

    return stats;
  }

  async compareServiceTypes() {
    const [cleaning, healthcare, maintenance] = await Promise.all([
      this.getServiceTypeStats('CLEANING'),
      this.getServiceTypeStats('HEALTHCARE'),
      this.getServiceTypeStats('MAINTENANCE')
    ]);

    return {
      CLEANING: cleaning,
      HEALTHCARE: healthcare,
      MAINTENANCE: maintenance
    };
  }
}

// Usage
const admin = new AdminJobAnalytics(adminToken);

// Get specific job stats
const jobStats = await admin.getJobStats('HC001', 'HEALTHCARE');
console.log('Job Stats:', jobStats);
// Output:
// {
//   jobID: "HC001",
//   serviceType: "HEALTHCARE",
//   acceptCount: 1,
//   completeCount: 1,
//   acceptedWorkers: 1,
//   maxWorkers: 1,
//   isFull: true,
//   completionRate: "100.00"
// }

// Compare all service types
const comparison = await admin.compareServiceTypes();
console.log('Service Type Comparison:', comparison);
// Output:
// {
//   CLEANING: { totalJobs: 50, avgAcceptsPerJob: 2.5, ... },
//   HEALTHCARE: { totalJobs: 30, avgAcceptsPerJob: 1.0, ... },
//   MAINTENANCE: { totalJobs: 40, avgAcceptsPerJob: 1.8, ... }
// }
```

---

### Example 3: Frontend UI - Job List với Status

```javascript
// React Component Example
import React, { useState, useEffect } from 'react';

function JobList({ serviceType, workerToken }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, [serviceType]);

  const loadJobs = async () => {
    try {
      // Get jobs
      const response = await fetch(
        `/job-actions/jobs/${serviceType}?limit=20`,
        {
          headers: { 'Authorization': `Bearer ${workerToken}` }
        }
      );
      const result = await response.json();
      let jobsData = result.data.jobs;

      // If HEALTHCARE, check which jobs are full
      if (serviceType === 'HEALTHCARE') {
        jobsData = await Promise.all(
          jobsData.map(async (job) => {
            const countResponse = await fetch(
              `/job-actions/job/${job.jobID}/accepted-count?serviceType=${serviceType}`,
              {
                headers: { 'Authorization': `Bearer ${workerToken}` }
              }
            );
            const countResult = await countResponse.json();
            return {
              ...job,
              isFull: countResult.data.isFull,
              acceptedWorkers: countResult.data.acceptedWorkers
            };
          })
        );
      }

      setJobs(jobsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading jobs:', error);
      setLoading(false);
    }
  };

  const handleAcceptJob = async (jobID) => {
    try {
      const response = await fetch('/job-actions/worker/accept', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${workerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobID, serviceType })
      });

      const result = await response.json();

      if (result.success) {
        alert('Accept job thành công!');
        loadJobs(); // Reload list
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Có lỗi xảy ra: ' + error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="job-list">
      <h2>{serviceType} Jobs</h2>
      {jobs.map(job => (
        <div key={job.jobID} className="job-card">
          <h3>{job.location?.name}</h3>
          <p>Price: {job.price?.toLocaleString()} VND</p>
          
          {serviceType === 'HEALTHCARE' && (
            <div className="healthcare-status">
              <span className={job.isFull ? 'badge-full' : 'badge-available'}>
                {job.isFull ? '🔴 Đã có worker' : '🟢 Còn trống'}
              </span>
              <span>Workers: {job.acceptedWorkers}/1</span>
            </div>
          )}

          {serviceType !== 'HEALTHCARE' && (
            <div className="multi-worker-status">
              <span>✅ {job.acceptCount || 0} workers accepted</span>
              <span>✔️ {job.completeCount || 0} completed</span>
            </div>
          )}

          <button
            onClick={() => handleAcceptJob(job.jobID)}
            disabled={serviceType === 'HEALTHCARE' && job.isFull}
            className={job.isFull ? 'btn-disabled' : 'btn-primary'}
          >
            {job.isFull ? 'Đã Full' : 'Accept Job'}
          </button>
        </div>
      ))}
    </div>
  );
}

export default JobList;
```

---

## 🎯 Best Practices

### 1. Luôn Check Trước Khi Accept (Healthcare)
```javascript
// ❌ BAD: Accept trực tiếp
await acceptJob(jobID, 'HEALTHCARE');

// ✅ GOOD: Check trước
const available = await checkJobAvailability(jobID, 'HEALTHCARE');
if (available) {
  await acceptJob(jobID, 'HEALTHCARE');
} else {
  showMessage('Job đã có worker rồi');
}
```

### 2. Hiển thị Status Rõ Ràng
```javascript
// Healthcare: Hiển thị full/available
if (serviceType === 'HEALTHCARE') {
  return job.isFull ? '🔴 Full' : '🟢 Available';
}

// Cleaning/Maintenance: Hiển thị số lượng
return `${job.acceptCount} workers accepted`;
```

### 3. Handle Errors Properly
```javascript
try {
  await acceptJob(jobID, serviceType);
} catch (error) {
  if (error.message.includes('already has 1 worker')) {
    showMessage('Job này đã có worker accept rồi');
  } else {
    showMessage('Có lỗi xảy ra, vui lòng thử lại');
  }
}
```

---

## 📊 Analytics Queries

### Query 1: Jobs với nhiều workers nhất
```javascript
const jobs = await getAllJobs();
const topJobs = jobs
  .filter(j => j.serviceType !== 'HEALTHCARE')
  .sort((a, b) => b.acceptCount - a.acceptCount)
  .slice(0, 10);
```

### Query 2: Completion rate theo service type
```javascript
const calculateCompletionRate = (jobs) => {
  const total = jobs.reduce((sum, j) => sum + (j.acceptCount || 0), 0);
  const completed = jobs.reduce((sum, j) => sum + (j.completeCount || 0), 0);
  return (completed / total * 100).toFixed(2);
};
```

### Query 3: Healthcare jobs availability
```javascript
const healthcareJobs = await getJobsByServiceType('HEALTHCARE');
const available = healthcareJobs.filter(j => (j.acceptCount || 0) === 0);
const full = healthcareJobs.filter(j => (j.acceptCount || 0) >= 1);

console.log(`Available: ${available.length}, Full: ${full.length}`);
```
