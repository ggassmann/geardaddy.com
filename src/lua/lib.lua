function loadText(fileName)
  local fileHnd, errMsg = io.open(fileName, "r")
  if not fileHnd then
      print("Failed to load file: "..fileName)
      os.exit(1)
      -- return nil, errMsg
  end
  local fileText = fileHnd:read("*a")
  fileHnd:close()
  return fileText
end

callbackTable = { }
function runCallback(name, ...)
  if callbackTable[name] then
      return callbackTable[name](...)
  elseif mainObject and mainObject[name] then
      return mainObject[name](mainObject, ...)
  end
end

function loadBuildFromXML(xmlText)
  mainObject.main:SetMode("BUILD", false, "", xmlText)
  runCallback("OnFrame")
end

function tprint (tbl, indent)
  if not indent then indent = 0 end
  for k, v in pairs(tbl) do
    formatting = string.rep("  ", indent) .. k .. ": "
    if type(v) == "table" then
      print(formatting)
      tprint(v, indent+1)
    elseif type(v) == 'boolean' then
      print(formatting .. tostring(v))      
    else
      print(formatting .. v)
    end
  end
end