const imageUpload = document.getElementById('imageUpload');

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

async function start() {

  const container = document.createElement('div')

  container.style.position = 'relative';
  container.style.width = 'auto';
  container.style.height = 'auto';

  document.body.append(container)

  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)

  let image
  let canvas

  document.body.append('Loaded')

  imageUpload.addEventListener('change', async () => {

    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(imageUpload.files[0])
    container.append(image)
    canvas = faceapi.createCanvasFromMedia(image)
    container.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)

    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvas)
    })
  
    const imagine = await document.querySelector("img");
    imagine.style.position = 'absolute';
    imagine.style.width = 'auto';
    imagine.style.maxHeight = '600px';
    imagine.style.margin = 'auto';
    imagine.style.top = '50%';
    imagine.style.left = '50%';
    imagine.style.transform = 'translate(-50%, -50%)';

    const canvas2 = await document.querySelector("canvas");
    canvas2.style.position = 'absolute';
    canvas2.style.width = 'auto';
    canvas2.style.maxHeight = '600px';
    canvas2.style.margin = 'auto';
    canvas2.style.top = '50%';
    canvas2.style.left = '50%';
    canvas2.style.transform = 'translate(-50%, -50%)';
  
  })



}

function loadLabeledImages() {
  const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Hulk', 'Jim Rhodes', 'Thor', 'Tony Stark']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/ibes33/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      //IBES33
      //https://github.com/ibes33/Face-Recognition-JavaScript/tree/master/labeled_images

      //WEBPACK
      //https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}

