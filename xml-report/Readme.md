# 📄 FIU-IND STR XML Report Generator

This module is part of the **Indian Loyalty Points Exchange Platform (ILPEP)** project.

It generates **Suspicious Transaction Reports (STR)** in XML format, compliant with FIU-IND requirements.

---

## 🚀 What This Service Does

* Takes a list of suspicious transactions (JSON)
* Validates the data
* Converts it into structured XML format
* Saves the report as a file

---

## 📌 XML Structure

The generated XML follows this format:

```
<Batch>
  <Report>
    <Transaction>
      <TransactionID>...</TransactionID>
      <UserID>...</UserID>
      <Amount>...</Amount>
      <Timestamp>...</Timestamp>
      <FraudScore>...</FraudScore>
    </Transaction>
  </Report>
</Batch>
```

---

## Features

* Input validation (required fields, types, ranges)
* ISO timestamp validation
* Error handling using try-except
* Logging support
* Pretty formatted XML output
* Modular code structure

---

##  Technologies Used

* Python 3
* xml.etree.ElementTree
* logging module

---

##  Project Structure

```
compliance-reporting-service/
│
├── fiu_ind_report.py   # Main XML generator
├── report.xml          # Generated output file
└── README.md           # Documentation
```

---

## How to Run

### 1. Navigate to folder

```
cd compliance-reporting-service
```

### 2. Run the script

```
python fiu_ind_report.py
```

---

##  Sample Input

```python
transactions = [
    {
        "transaction_id": "TXN001",
        "user_id": "USER123",
        "amount": 50000,
        "timestamp": "2026-03-29T10:30:00",
        "fraud_score": 0.92
    }
]
```

---

## Sample Output

```xml
<Batch>
  <Report>
    <Transaction>
      <TransactionID>TXN001</TransactionID>
      <UserID>USER123</UserID>
      <Amount>50000</Amount>
      <Timestamp>2026-03-29T10:30:00</Timestamp>
      <FraudScore>0.92</FraudScore>
    </Transaction>
  </Report>
</Batch>
```

---

## Main Function

```python
GenerateFIUINDReport(transactions, output_file="report.xml")
```

### Parameters:

* `transactions`: list of transaction dictionaries
* `output_file`: XML file name

---

## Error Handling

* Missing fields → raises error
* Invalid data types → raises error
* Invalid timestamp → raises error
* All errors are logged for debugging

---

## Use Case

* Fraud detection systems
* Financial compliance reporting
* AML (Anti-Money Laundering) workflows

---

## Author

**Bhakti (Member 5 - DevOps & Compliance Engineer)**

---

## 💡 Future Improvements

* Add digital signature for XML
* Integrate with real FIU-IND API
* Add database support
* Automate report generation

---
