FROM image-registry.openshift-image-registry.svc:5000/auh-cimdev-fe/nginx-120:1-155 as production-stage

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy React build files to Nginx HTML directory
COPY . /usr/share/nginx/html

# Expose port 3000 (Nginx default in OpenShift)
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
