# Imagen base con Node.js 20.17
FROM node:20.17-alpine


# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos necesarios para instalar dependencias
COPY package*.json ./

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto de la aplicación
# (No lo expone como tal, es de manera visual para saber cual estamos usando)
EXPOSE 3000

# Cambia a un usuario no root para mayor seguridad
RUN addgroup appgroup && adduser -S appuser -G appgroup
USER appuser

# Comando para iniciar la aplicación
CMD ["node", "escuchar.js"]
