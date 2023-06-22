document.getElementById('print-button').addEventListener('click', function() {
  var text = document.getElementById('text-input').value;
  if (text) {
    fetch('/print', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: text })
    })
    .then(function(response) {
      if (response.ok) {
        console.log('Texto enviado correctamente a la impresora térmica.');
      } else {
        console.error('Error al enviar el texto a la impresora térmica.');
      }
    })
    .catch(function(error) {
      console.error('Error al enviar la solicitud:', error);
    });
  }
});
