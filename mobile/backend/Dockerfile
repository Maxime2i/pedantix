FROM python:3.11-slim

WORKDIR /app

ENV PEDANTIX_DATA_DIR=/app/data
ENV PYTHONUNBUFFERED=1

# curl : téléchargement des embeddings ; unzip : fallback (.zip).
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl unzip \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py lemmatize.py stopwords.py download_embeddings.sh reduce_embeddings.py entrypoint.sh ./
# Les 300 articles du jour (petit fichier) : copiés dans l'image ; seuls les
# embeddings (750 Mo) sont bootstrappés dans le volume.
COPY data/articles.json ./data/articles.json
RUN chmod +x /app/download_embeddings.sh /app/entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/app/entrypoint.sh"]
