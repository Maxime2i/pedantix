FROM python:3.11-slim

WORKDIR /app

ENV PEDANTIX_DATA_DIR=/app/data
ENV PYTHONUNBUFFERED=1

# curl : téléchargement du modèle frWac et de Lexique au premier démarrage.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py lemmatize.py build_lexicon.py prepare_embeddings.py prepare_data.sh entrypoint.sh ./
# Le pool d'articles (petit fichier) est dans l'image ; le modèle et le
# lexique sont préparés dans le volume au premier démarrage.
COPY data/articles.json /app/articles.json
RUN chmod +x /app/prepare_data.sh /app/entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/app/entrypoint.sh"]
