const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const usb = require('usb');

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/print', function(req, res) {
  const text = req.body.text;

  const vendorId = 0x0483; // Identificador de vendor de la impresora térmica
  const productId = 0x5743; // Identificador de product de la impresora térmica
  const device = usb.findByIds(vendorId, productId);

  if (device) {
    device.open();

    const iface = device.interface(0);
    iface.claim();

    // Enviar comando para aumentar el tamaño de la letra
    const fontSizeCommand = Buffer.from([0x1B, 0x21, 0x10]); // Comando para aumentar el tamaño de la letra
    iface.endpoint(0x01).transfer(fontSizeCommand, function(error) {
      if (error) {
        console.error('Error al enviar el comando de tamaño de letra:', error);
      } else {
        console.log('Tamaño de letra modificado correctamente.');
      }
    });

    // Enviar comando para establecer los márgenes
    const topMargin = 10; // Márgen superior en puntos
    const bottomMargin = 10; // Márgen inferior en puntos
    const marginsCommand = Buffer.from([0x1B, 0x4C, topMargin, bottomMargin]); // Comando para establecer márgenes
    iface.endpoint(0x01).transfer(marginsCommand, function(error) {
      if (error) {
        console.error('Error al enviar el comando de márgenes:', error);
      } else {
        console.log('Márgenes modificados correctamente.');
      }
    });

    // Enviar texto a imprimir
    iface.endpoint(0x01).transfer(text, function(error) {
      if (error) {
        console.error('Error al enviar el texto a la impresora térmica:', error);
        res.sendStatus(500);
      } else {
        console.log('Texto enviado correctamente a la impresora térmica.');

        // Enviar comando de corte de papel
        const cutCommand = Buffer.from([0x1D, 0x56, 0x41, 0x10]); // Comando de corte de papel
        iface.endpoint(0x01).transfer(cutCommand, function(error) {
          if (error) {
            console.error('Error al enviar el comando de corte de papel:', error);
          } else {
            console.log('Papel cortado correctamente.');
          }
        });

        res.sendStatus(200);
      }

      iface.release(true, function(error) {
        if (error) {
          console.error('Error al liberar la interfaz de la impresora térmica:', error);
        }
        device.close();
      });
    });
  } else {
    console.error('Impresora térmica no encontrada.');
    res.sendStatus(500);
  }
});

app.listen(3000, function() {
  console.log('Servidor escuchando en el puerto 3000.');
});
