CREATE TABLE `users` (
  `id` integer PRIMARY KEY,
  `nombre` varchar(255),
  `apellido` varchar(255),
  `email` varchar(255) UNIQUE,
  `password` varchar(255),
  `telefono` varchar(255),
  `rol` varchar(255),
  `verificado` boolean,
  `foto_perfil` varchar(255),
  `created_at` timestamp
);

CREATE TABLE `propiedades` (
  `id` integer PRIMARY KEY,
  `usuario_id` integer NOT NULL,
  `titulo` varchar(255),
  `descripcion` text,
  `direccion` varchar(255),
  `ciudad` varchar(255),
  `precio` decimal,
  `tipo` varchar(255),
  `servicios` text,
  `estado_disponibilidad` varchar(255),
  `fecha_publicacion` timestamp
);

CREATE TABLE `resenas` (
  `id` integer PRIMARY KEY,
  `propiedad_id` integer NOT NULL,
  `usuario_id` integer NOT NULL,
  `calificacion` integer,
  `comentario` text,
  `fecha_resena` timestamp
);

CREATE TABLE `mensajes` (
  `id` integer PRIMARY KEY,
  `emisor_id` integer NOT NULL,
  `receptor_id` integer NOT NULL,
  `contenido` text,
  `fecha_envio` timestamp,
  `estado` varchar(255)
);

CREATE TABLE `favoritos` (
  `id` integer PRIMARY KEY,
  `usuario_id` integer NOT NULL,
  `propiedad_id` integer NOT NULL,
  `fecha_agregado` timestamp
);

ALTER TABLE `propiedades` ADD FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`);

ALTER TABLE `resenas` ADD FOREIGN KEY (`propiedad_id`) REFERENCES `propiedades` (`id`);

ALTER TABLE `resenas` ADD FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`);

ALTER TABLE `mensajes` ADD FOREIGN KEY (`emisor_id`) REFERENCES `users` (`id`);

ALTER TABLE `mensajes` ADD FOREIGN KEY (`receptor_id`) REFERENCES `users` (`id`);

ALTER TABLE `favoritos` ADD FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`);

ALTER TABLE `favoritos` ADD FOREIGN KEY (`propiedad_id`) REFERENCES `propiedades` (`id`);
