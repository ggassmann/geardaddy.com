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

	-- Extract new item's info to a fake tooltip
  local tooltip = {}
  function tooltip:AddLine(type, txt)
    if string.find(txt, 'will give you') ~= nil then
      return
    end
    if type == 14 then
      print(string.sub(txt, 9))
    end
  end
  function tooltip:AddSeparator(_, _) end
	build.itemsTab:AddItemTooltip(tooltip, item)
end