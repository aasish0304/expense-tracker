# ================================
# Waku Expense Tracker - Backend
# ================================

FROM python:3.13-slim

WORKDIR /app

# Prevent Python from creating .pyc files
ENV PYTHONDONTWRITEBYTECODE=1

# Send Python output directly to the terminal
ENV PYTHONUNBUFFERED=1

# Install Python dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy Django project
COPY . .

# Django listens on port 8000
EXPOSE 8000

# Start Django using Gunicorn
CMD ["gunicorn", "expense_tracker.wsgi:application", "--bind", "0.0.0.0:8000"]