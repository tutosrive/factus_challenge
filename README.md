# Reto [Factus](https://developers.factus.com.co/) - Propuesto por "[Halltec](https://halltec.co/)"
---
**[Vídeo Del Reto Factus](https://youtu.be/PI5bEsuY1aA?si=FPCjpjvUSzby0OZ9)**

---

<div style="display: flex; align-items: center; justify-content: center; margin: 10px 0; gap: 10px; max-height: 48px; height: 48px;">
  <a href="https://github.com/sponsors/tutosrive" target="_blank">
  <img src="https://img.shields.io/badge/Sponsor-%F0%9F%92%96%20tutosrive-orange?style=for-the-badge&logo=github" alt="Sponsor me on GitHub">
</a>
  <a href="https://www.buymeacoffee.com/tutosrive">
    <img 
      src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=tutosrive&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" 
      style="height: 48px; width: auto; object-fit: contain; border-radius: 6px;" 
      alt="Buy me a coffee button">
  </a>
</div>

---
## Certificado
![certificado](https://github.com/user-attachments/assets/0e11b96f-d836-4ebe-9737-384196a254c9)

¡Hola buenas!, mi nombre real es **[Santiago Rivera Marin](https://www.instagram.com/santiago.riveramarin.524/)**, tengo 19 años de edad, y este repositorio almacena el **Reto Factus** propuesto por el equipo de la _empresa_ "**[Halltec](https://halltec.co/)**".

El equipo de "**[Halltec](https://halltec.co/)**", tiene una **[API](https://www.ibm.com/mx-es/topics/api)** de **[Facturación Electrónica](https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/factura-electronica/)**, la cuál está programada en **[PHP](https://www.php.net/manual/es/intro-whatis.php)**, sí, **PHP** aún existe y es poderoso, lo digo porque los tiempos de respuesta de esta **[API](https://www.ibm.com/mx-es/topics/api)** de "**[Halltec](https://halltec.co/)**" son muy rápidos.
Pues bien, el reto consiste en **conectar** esa **[API](https://www.ibm.com/mx-es/topics/api)** con nuestro "_sistema_", no importa cual hubiese sido, ya sea desde un **[backend](https://www.gluo.mx/blog/backend-que-es-y-para-que-sirve)** en **python** hasta un **[backend](https://www.gluo.mx/blog/backend-que-es-y-para-que-sirve)** en **[.NET](https://dotnet.microsoft.com/es-es/learn/dotnet/what-is-dotnet)**, en cualquier sistema, no importa cual fuere, y el reto está en los desafíos que conlleva conectar esta **[API](https://www.ibm.com/mx-es/topics/api)**, por su sistema de autenticación **[OAUTH 2.0](https://auth0.com/es/intro-to-iam/what-is-oauth-2)**, por lo cual se debe generar **[Token de acceso](https://globalfishingwatch.org/es/faqs/que-es-un-token-de-acceso-a-la-api/)** para poder acceder a los **[endpoints](https://mailchimp.com/es/resources/what-is-an-api-endpoint/)** de la **[API](https://www.ibm.com/mx-es/topics/api)**, además,
en los desafíos que tiene el reto, está el de _¿cómo crear un [CRUD](https://blog.hubspot.es/website/que-es-crud)?_, esto porque el reto en sí, no sólo es conectar el **[API](https://www.ibm.com/mx-es/topics/api)** en interfaces como lo son **[Insomnia](https://insomnia.rest/)** y **[Postman](https://www.postman.com/)**, pues no, más allá de enviar **[Peticiones HTTP](https://kinsta.com/es/base-de-conocimiento/que-es-una-peticion-http/)** desde un programa ya existente, ajeno a nuestro "Sistema", a fin de cuentas, si no teníamos un "sistema" ya programado, debíamos realizarlo, ya el método de interfaz no importa, es decir, cada quien identifica si necesita un **[backend](https://www.gluo.mx/blog/backend-que-es-y-para-que-sirve)** o si se hace todo desde el frontend.

Por mi parte, decidí hacer un **[backend](https://www.gluo.mx/blog/backend-que-es-y-para-que-sirve)**, para el cual usé **[Node.js (v22.12.0)](https://nodejs.org/es)** y paquetes de este mismo como lo son:
  - **[axios (v1.7.9)](https://axios-http.com/es/docs/intro)**: Usado para realizar **[Peticiones HTTP](https://kinsta.com/es/base-de-conocimiento/que-es-una-peticion-http/)** desde el **[backend](https://www.gluo.mx/blog/backend-que-es-y-para-que-sirve)**
  - **[express (v4.21.2)](https://expressjs.com/)**: Usado para crear los **[endpoints](https://mailchimp.com/es/resources/what-is-an-api-endpoint/)** de mi **[backend](https://www.gluo.mx/blog/backend-que-es-y-para-que-sirve)**
  - **[pg (v8.13.1)](https://node-postgres.com/)**: Usado para el [CRUD](https://blog.hubspot.es/website/que-es-crud) en **[POSTGRES](https://www.postgresql.org/)**
  - **[morgan (v1.10.0)](https://www.npmjs.com/package/morgan)**: Usado para mostrar por consola los registros de las peticiones que se hacen.
  - **[Postgres](https://www.postgresql.org/)**: Usado para almacenar datos de clientes, productos y tablas de configuraciones del reto

Para el frontend, lo "normalito":
  - **[Javascript](https://developer.mozilla.org/es/docs/Learn_web_development/Core/Scripting/What_is_JavaScript)**: Usado para darle interactividad al **[frontend](https://www.arsys.es/blog/frontend-que-es-y-para-que-se-utiliza-en-desarrollo-web)** y enviar **[Peticiones HTTP](https://kinsta.com/es/base-de-conocimiento/que-es-una-peticion-http/)** a mi **[backend](https://www.gluo.mx/blog/backend-que-es-y-para-que-sirve)**
  - **[CSS](https://lenguajecss.com/css/introduccion/que-es-css/)**: Pues, no creo que sea para algo más o ¿sí?
  - **[HTML](https://developer.mozilla.org/es/docs/Web/HTML)**: Estructura del frontend
  - **[Bootstrap](https://getbootstrap.com/docs/5.3/getting-started/introduction/)**: Usado para dar un estilo good al frontend

Servidores:
  - **[azure.com](https://azure.microsoft.com/es-es/resources/cloud-computing-dictionary/what-is-azure/)**: Usado para almacenar la base de datos de **[POSTGRES](https://www.postgresql.org/)**
  - **[koyeb.com](https://www.koyeb.com/docs)**: Usado para almacenar y servir el **[backend](https://www.gluo.mx/blog/backend-que-es-y-para-que-sirve)** del reto
  - **[render.com](https://render.com/about)**: Usado para almacenar y servir el **[frontend](https://www.arsys.es/blog/frontend-que-es-y-para-que-se-utiliza-en-desarrollo-web)**

Gracias al equipo de "**[Halltec](https://halltec.co/)**".
