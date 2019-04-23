local BUILD_XML = arg[1]
local ITEM_TEXT = arg[2]
local _,_,SCRIPT_PATH=string.find(arg[0], "(.+[/\\]).-")

mainObject = nil

dofile(SCRIPT_PATH .. 'lib.lua');
dofile(SCRIPT_PATH .. 'HeadlessWrapper.lua');

build = mainObject.main.modes["BUILD"]

loadBuildFromXML(BUILD_XML)
local item = new("Item", build.targetVersion, ITEM_TEXT)

if item.base then
	item:BuildModList()

  local tooltip = {}
  function tooltip:AddLine(type, txt)
    if string.find(txt, 'will give you') ~= nil then
      print('SLOT|'..txt:gsub('%W',''))
      return
    end
    if type == 14 then
      local isPositive = string.find(string.sub(txt, 0, 9), 'x33FF77') ~= nil
      print((isPositive and 'true' or 'false') .. '|' .. string.sub(txt, 9))
    end
  end
  function tooltip:AddSeparator(_, _) end
	build.itemsTab:AddItemTooltip(tooltip, item)
end