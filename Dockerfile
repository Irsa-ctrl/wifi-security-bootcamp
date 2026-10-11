FROM python:3.11-slim

RUN apt-get update && apt-get install -y network-manager && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt gunicorn

COPY . .

EXPOSE 7860

CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--chdir", "backend", "app:app"]
