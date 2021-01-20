import os, time, re, math, subprocess

from wslink import register as exportRpc

from paraview import simple, servermanager
from paraview.web import protocols as pv_protocols

from vtkmodules.vtkCommonCore import vtkUnsignedCharArray, vtkCollection
from vtkmodules.vtkCommonDataModel import vtkImageData
from vtkmodules.vtkWebCore import vtkDataEncoder

from distutils.dir_util import copy_tree

try:
    # PV 5.6
    from vtkmodules.vtkPVClientServerCoreRendering import vtkPVRenderView
    from vtkmodules.vtkPVServerManagerRendering import vtkSMPVRepresentationProxy, vtkSMTransferFunctionProxy, vtkSMTransferFunctionManager
except:
    pass

try:
    # PV 5.7
    from paraview.modules.vtkPVClientServerCoreRendering import vtkPVRenderView
    from paraview.modules.vtkPVServerManagerRendering import vtkSMPVRepresentationProxy, vtkSMTransferFunctionProxy, vtkSMTransferFunctionManager
except:
    pass

try:
    # PV 5.8
    from paraview.servermanager import vtkPVRenderView
    from paraview.servermanager import vtkSMPVRepresentationProxy
    from paraview.servermanager import vtkSMTransferFunctionManager
    from paraview.servermanager import vtkSMTransferFunctionProxy
except:
    pass

class ParaViewLite(pv_protocols.ParaViewWebProtocol):
    def __init__(self, data_dir, **kwargs):
      super(pv_protocols.ParaViewWebProtocol, self).__init__()
      self.lineContext = None
      self.data_dir = data_dir + '/'

    @exportRpc("paraview.lite.proxy.name")
    def getProxyName(self, pid):
      proxy = self.mapIdToProxy(pid)
      if not proxy:
        return {
          'id': pid,
          'error': 'No proxy for id %s' % pid,
        }

      return {
        'id': pid,
        'group': proxy.GetXMLGroup(),
        'name': proxy.GetXMLName(),
        'label': proxy.GetXMLLabel(),
      }

    @exportRpc("paraview.lite.camera.get")
    def getCamera(self, viewId):
      view = self.getView(viewId)
      bounds = [-1, 1, -1, 1, -1, 1]

      if view and view.GetClientSideView().GetClassName() == 'vtkPVRenderView':
        rr = view.GetClientSideView().GetRenderer()
        bounds = rr.ComputeVisiblePropBounds()

      return {
        'id': viewId,
        'bounds': bounds,
        'position': tuple(view.CameraPosition),
        'viewUp': tuple(view.CameraViewUp),
        'focalPoint': tuple(view.CameraFocalPoint),
        'centerOfRotation': tuple(view.CenterOfRotation),
      }

    @exportRpc("paraview.lite.fibonacci.next")
    def nextFibonacci(self, value):
      # fibos = [1,2,3,5,8,13,21,34,55,89]
      print('fibo next ', value)
      return {
        'value': 5
      }

    @exportRpc("paraview.lite.mesh.surfaces")
    def meshGetRefinementSurfaces(self, path):
      try:
        fileName = self.data_dir + path + '/constant/polyMesh/blockMeshDict'
        file1 = open(fileName, 'r') 
        Lines = file1.readlines() 
        words = []
        inside = False
        firstParenthesis = False
        current = 0
        prevLine = ''
        for line in Lines: 
            if (not inside):
                if (line.find('boundary') != -1):
                    inside = True
                    if (line.find('(') != -1):
                        openParenthesis = line.count('(')
                        closeParenthesis = line.count(')')
                        current = current + openParenthesis - closeParenthesis
                        firstParenthesis = True
            else:
                pos = line.find('{')
                if ( pos != -1):
                    word = line[0:pos].strip()
                    if len(word) == 0:
                        word = prevLine.strip()
                    words.append(word)
                openParenthesis = line.count('(')
                closeParenthesis = line.count(')')
                current = current + openParenthesis - closeParenthesis
                if current == 0 and firstParenthesis:
                    break
            prevLine = line
        return words

      except Exception as e:
        print('except ', e)
        pass

    @exportRpc("paraview.lite.mesh.run")
    def meshRun(self, path, resolution, refinements):
      fullPath = self.data_dir + path
      print('mesh run path: ', fullPath, '; resolution: ', resolution, '; refinements: ', refinements)
      fileName = fullPath + '/constant/polyMesh/blockMeshDict'
      with open(fileName, "r") as f:
        s=f.read()
      #clean up the C/C++ comments
      def stripcomments(text):
        return re.sub('//.*?(\r\n?|\n)|/\*.*?\*/', '', text, flags=re.S)
      s=stripcomments(s)
      s = s[s.find('vertices'):]
      s = s[:s.find(';')]
      # extract the vertices into a list of tuples
      r1 = re.search(r'vertices\s*\(\s*(.*)\s*\)', s, re.DOTALL)
      vertices = [(float(v[0]),float(v[1]),float(v[2]))
              for v in re.findall(r'\(\s*([-0-9.]+)\s+([-0-9.]+)\s+([-0-9.]+)\s*\)', r1.group(1))]
      maxVal = max(vertices)
      minVal = min(vertices)
      print('maxVal', maxVal)
      print('minVal', minVal)
      r = resolution/1000
      cellsX = math.floor((maxVal[0] - minVal[0])/r)
      cellsY = math.floor((maxVal[1] - minVal[1])/r)
      cellsZ = math.floor((maxVal[2] - minVal[2])/r)
      f = open(fullPath + '/UISettings', 'w')
      f.write('NODES (' + str(cellsX) + ' ' + str(cellsY) + ' ' + str(cellsZ) + ');\n')
      for refinement in refinements:
        f.write('min' + refinement['label'] + ' ' + str(refinement['min']) + ';\n')
        print('min' + refinement['label'] + ' ' + str(refinement['min']) + ';')
        f.write('max' + refinement['label'] + ' ' + str(refinement['max']) + ';\n')
        print('max' + refinement['label'] + ' ' + str(refinement['max']) + ';')
      f.close()
      print('exit',fullPath + '/UISettings', 'NODES (' + str(cellsX) + ' ' + str(cellsY) + ' ' + str(cellsZ) + ')')     
      subprocess.run(["blockMesh", "-case", fullPath])
      # time.sleep(5)

      return vertices

    @exportRpc("paraview.lite.lut.get")
    def getLookupTableForArrayName(self, name, numSamples = 255):
      lutProxy = simple.GetColorTransferFunction(name)
      lut = lutProxy.GetClientSideObject()
      dataRange = lut.GetRange()
      delta = (dataRange[1] - dataRange[0]) / float(numSamples)

      colorArray = vtkUnsignedCharArray()
      colorArray.SetNumberOfComponents(3)
      colorArray.SetNumberOfTuples(numSamples)

      rgb = [ 0, 0, 0 ]
      for i in range(numSamples):
          lut.GetColor(dataRange[0] + float(i) * delta, rgb)
          r = int(round(rgb[0] * 255))
          g = int(round(rgb[1] * 255))
          b = int(round(rgb[2] * 255))
          colorArray.SetTuple3(i, r, g, b)

      # Add the color array to an image data
      imgData = vtkImageData()
      imgData.SetDimensions(numSamples, 1, 1)
      aIdx = imgData.GetPointData().SetScalars(colorArray)

      # Use the vtk data encoder to base-64 encode the image as png, using no compression
      encoder = vtkDataEncoder()
      # two calls in a row crash on Windows - bald timing hack to avoid the crash.
      time.sleep(0.01);
      b64Str = encoder.EncodeAsBase64Jpg(imgData, 100)

      return { 'image': 'data:image/jpg;base64,' + b64Str, 'range': dataRange, 'name': name }


    @exportRpc("paraview.lite.lut.range.update")
    def updateLookupTableRange(self, arrayName, dataRange):
      lutProxy = simple.GetColorTransferFunction(arrayName)
      vtkSMTransferFunctionProxy.RescaleTransferFunction(lutProxy.SMProxy, dataRange[0], dataRange[1], False)
      self.getApplication().InvokeEvent('UpdateEvent')


    @exportRpc("paraview.lite.lut.preset")
    def getLookupTablePreset(self, presetName, numSamples = 512):
      lutProxy = simple.GetColorTransferFunction('__PRESET__')
      lutProxy.ApplyPreset(presetName, True)
      lut = lutProxy.GetClientSideObject()
      dataRange = lut.GetRange()
      delta = (dataRange[1] - dataRange[0]) / float(numSamples)

      colorArray = vtkUnsignedCharArray()
      colorArray.SetNumberOfComponents(3)
      colorArray.SetNumberOfTuples(numSamples)

      rgb = [ 0, 0, 0 ]
      for i in range(numSamples):
          lut.GetColor(dataRange[0] + float(i) * delta, rgb)
          r = int(round(rgb[0] * 255))
          g = int(round(rgb[1] * 255))
          b = int(round(rgb[2] * 255))
          colorArray.SetTuple3(i, r, g, b)

      # Add the color array to an image data
      imgData = vtkImageData()
      imgData.SetDimensions(numSamples, 1, 1)
      aIdx = imgData.GetPointData().SetScalars(colorArray)

      # Use the vtk data encoder to base-64 encode the image as png, using no compression
      encoder = vtkDataEncoder()
      # two calls in a row crash on Windows - bald timing hack to avoid the crash.
      time.sleep(0.01);
      b64Str = encoder.EncodeAsBase64Jpg(imgData, 100)

      return { 'name': presetName, 'image': 'data:image/jpg;base64,' + b64Str }


    @exportRpc("paraview.lite.lut.set.preset")
    def applyPreset(self, arrayName, presetName):
      lutProxy = simple.GetColorTransferFunction(arrayName)
      lutProxy.ApplyPreset(presetName, True)
      self.getApplication().InvokeEvent('UpdateEvent')


    @exportRpc("paraview.lite.context.line.set")
    def updateLineContext(self, visible = False, p1 = [0, 0, 0], p2 = [1, 1, 1]):
      if not self.lineContext:
        self.lineContext = servermanager.extended_sources.HighResolutionLineSource(Resolution=2, Point1=p1, Point2=p2)
        self.lineRepresentation = simple.Show(self.lineContext)

      self.lineRepresentation.Visibility = 1 if visible else 0
      self.lineContext.Point1 = p1
      self.lineContext.Point2 = p2

      self.getApplication().InvokeEvent('UpdateEvent')

      return self.lineContext.GetGlobalIDAsString()


