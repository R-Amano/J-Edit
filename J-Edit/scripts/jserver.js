import{BlockPermutation,world,system}from"@minecraft/server";

/*////////////////////////////////////////
Minecraft Bedrock Edition World Edit Tool.
          ++ J-Edit Add-On ++
    (c) J'server / Ryosuke Amano
*/////////////////////////////////////////

world.beforeEvents.playerInteractWithBlock.subscribe(e=>{
  const ep=e.player;
  const ei=e.itemStack;
  const ex=e.block.location.x;
  const ey=e.block.location.y;
  const ez=e.block.location.z;
  if(ei!=undefined&&e.isFirstEvent==true&&ei.typeId=="je:wand"){
    ep.runCommandAsync(`scoreboard players set @s ra_x2 ${ex}`);
    ep.runCommandAsync(`scoreboard players set @s ra_y2 ${ey}`);
    ep.runCommandAsync(`scoreboard players set @s ra_z2 ${ez}`);
    ep.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§dpos2を設定しました [${ex},${ey},${ez}]"}]}`);
    e.cancel=true;
  }
    if(ei!=undefined&&e.isFirstEvent==true&&ei.typeId=="je:repl"){
    ep.runCommandAsync(`clone ${sc("ra_x1",ep)} ${sc("ra_y1",ep)} ${sc("ra_z1",ep)} ${sc("ra_x1",ep)} ${sc("ra_y1",ep)} ${sc("ra_z1",ep)} ${ex} ${ey} ${ez}`);
    e.cancel=true;
  }
  if(ei!=undefined&&e.isFirstEvent==true&&ei.typeId=="je:stack"){
    if(e.blockFace=="Up"){
      for(let i=1;i<6;i++)ep.runCommandAsync(`execute if block ${ex} ${ey+i} ${ez} air run clone ${ex} ${ey} ${ez} ${ex} ${ey} ${ez} ${ex} ${ey+i} ${ez}`);
    }
    if(e.blockFace=="Down"){
      for(let i=1;i<6;i++)ep.runCommandAsync(`execute if block ${ex} ${ey-i} ${ez} air run clone ${ex} ${ey} ${ez} ${ex} ${ey} ${ez} ${ex} ${ey-i} ${ez}`);
    }
    if(e.blockFace=="North"){
      for(let i=1;i<6;i++)ep.runCommandAsync(`execute if block ${ex} ${ey} ${ez-i} air run clone ${ex} ${ey} ${ez} ${ex} ${ey} ${ez} ${ex} ${ey} ${ez-i}`);
    }
    if(e.blockFace=="South"){
      for(let i=1;i<6;i++)ep.runCommandAsync(`execute if block ${ex} ${ey} ${ez+i} air run clone ${ex} ${ey} ${ez} ${ex} ${ey} ${ez} ${ex} ${ey} ${ez+i}`);
    }
    if(e.blockFace=="East"){
      for(let i=1;i<6;i++)ep.runCommandAsync(`execute if block ${ex+i} ${ey} ${ez} air run clone ${ex} ${ey} ${ez} ${ex} ${ey} ${ez} ${ex+i} ${ey} ${ez}`);
    }
    if(e.blockFace=="West"){
      for(let i=1;i<6;i++)ep.runCommandAsync(`execute if block ${ex-i} ${ey} ${ez} air run clone ${ex} ${ey} ${ez} ${ex} ${ey} ${ez} ${ex-i} ${ey} ${ez}`);
    }
    e.cancel=true;
  }
});

world.beforeEvents.playerBreakBlock.subscribe(e=>{
  const ep=e.player;
  const ei=e.itemStack;
  if(ei!=undefined&&ei.typeId=="je:wand"){
    ep.runCommandAsync(`scoreboard players set @s ra_x1 ${e.block.location.x}`);
    ep.runCommandAsync(`scoreboard players set @s ra_y1 ${e.block.location.y}`);
    ep.runCommandAsync(`scoreboard players set @s ra_z1 ${e.block.location.z}`);
    ep.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§dpos1を設定しました [${e.block.location.x},${e.block.location.y},${e.block.location.z}]"}]}`);
    e.cancel=true;
  }
    if(ei!=undefined&&ei.typeId=="je:repl"){
    ep.runCommandAsync(`scoreboard players set @s ra_x1 ${e.block.location.x}`);
    ep.runCommandAsync(`scoreboard players set @s ra_y1 ${e.block.location.y}`);
    ep.runCommandAsync(`scoreboard players set @s ra_z1 ${e.block.location.z}`);
    ep.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§dpos1を設定、記憶しました [${e.block.location.x},${e.block.location.y},${e.block.location.z}]"}]}`);
    e.cancel=true;
  }
});

function sc(l,e){
  return world.scoreboard.getObjective(l).getScore(e.scoreboardIdentity);
}

function drawLine(e,blockId){
  const dim=e.dimension;
  const x1=sc("ra_x1",e);
  const y1=sc("ra_y1",e);
  const z1=sc("ra_z1",e);
  const x2=sc("ra_x2",e);
  const y2=sc("ra_y2",e);
  const z2=sc("ra_z2",e);
  const dx=x2-x1;
  const dy=y2-y1;
  const dz=z2-z1;
  const steps=Math.max(Math.abs(dx),Math.abs(dy),Math.abs(dz));
  for (let i=0;i<=steps;i++){
    const t=i/steps;
    dim.getBlock({x:Math.round(x1+dx*t),y:Math.round(y1+dy*t),z:Math.round(z1+dz*t)}).setPermutation(BlockPermutation.resolve(blockId));
  }
}

function plot8(dim,perm,cx,cy,cz,x,z) {
  const pts=[
    {x:cx+x,y:cy,z:cz+z},
    {x:cx-x,y:cy,z:cz+z},
    {x:cx+x,y:cy,z:cz-z},
    {x:cx-x,y:cy,z:cz-z},
    {x:cx+z,y:cy,z:cz+x},
    {x:cx-z,y:cy,z:cz+x},
    {x:cx+z,y:cy,z:cz-x},
    {x:cx-z,y:cy,z:cz-x}
  ];
  for(const p of pts)dim.getBlock(p).setPermutation(perm);
}

function drawCircle(dim,cx,cy,cz,radius,perm) {
  let x=radius;
  let z=0;
  let d=1-radius;
  plot8(dim,perm,cx,cy,cz,x,z);
  while(z<x){
    z++;
    if(d<0){
      d+=2*z+1;
    }else{
      x--;
      d+=2*(z-x)+1;
    }
    plot8(dim,perm,cx,cy,cz,x,z);
  }
}

system.afterEvents.scriptEventReceive.subscribe(e=>{
  const scores=["ra_x1","ra_y1","ra_z1","ra_x2","ra_y2","ra_z2"];
  const es=e.sourceEntity;
  const el=e.sourceEntity.location;
  if(e.id=="je:help"){
    es.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§a===== J-Edit Add-On ====="}]}`);
    es.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§f- /scriptevent je:wand §9 §o セットアップ"}]}`);
    es.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§f- /scriptevent je:reset §9 §o 保存しているスコアの削除"}]}`);
    es.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§f- /scriptevent je:fill <block> §7[data] replace [block] [data] §9 §o 範囲でfillを実行"}]}`);
    es.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§f- /scriptevent je:cut §9 §o 範囲を空気に置き換える"}]}`);
    es.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§f- /scriptevent je:clone §9 §o 範囲をコピーし、自分の座標を起点に貼り付け"}]}`);
    es.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§f- /scriptevent je:line §7[block] §9 §o 2点間に線を引く"}]}`);
    es.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§f- /scriptevent je:circle §7[r-size] [block] §9 §o §cbata:§9pos1を中心に円を作成する"}]}`);
  }

  if(e.id=="je:circle"){
    const [rStr,idStr]=e.message.trim().split(/\s+/);
    drawCircle(es.dimension,sc("ra_x1",es),sc("ra_y1",es),sc("ra_z1",es),Math.max(1,parseInt(rStr?rStr:"5")),BlockPermutation.resolve(idStr?`minecraft:${idStr}`:"minecraft:stone"));
    es.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§d実行しました (circle)"}]}`);
  }
  if(e.id=="je:wand"){
    for(const s of scores)es.runCommandAsync(`scoreboard objectives add ${s} dummy`);
    es.runCommandAsync(`give @s je:wand`);
    es.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§dセットアップを実行しました\n- J-Edit Axe を持ってタッチ、破壊で座標を指定します\n- /scriptevent je:help でヒントを開きます"}]}`);
  }
  if(e.id=="je:reset"){
    for(const s of scores)es.runCommandAsync(`scoreboard players reset @s ${s}`);
    es.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§d保存しているスコアを削除しました"}]}`);
  }
  if(e.id=="je:fill"||e.id=="je:set"){
    es.runCommandAsync(`fill ${sc("ra_x1",es)} ${sc("ra_y1",es)} ${sc("ra_z1",es)} ${sc("ra_x2",es)} ${sc("ra_y2",es)} ${sc("ra_z2",es)} ${e.message}`);
    es.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§d実行しました (fill)"}]}`);
  }
    if(e.id=="je:cut"){
    es.runCommandAsync(`fill ${sc("ra_x1",es)} ${sc("ra_y1",es)} ${sc("ra_z1",es)} ${sc("ra_x2",es)} ${sc("ra_y2",es)} ${sc("ra_z2",es)} air`);
    es.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§d実行しました (cut)"}]}`);
  }
  if(e.id=="je:clone"){
    es.runCommandAsync(`clone ${sc("ra_x1",es)} ${sc("ra_y1",es)} ${sc("ra_z1",es)} ${sc("ra_x2",es)} ${sc("ra_y2",es)} ${sc("ra_z2",es)} ${el.x} ${el.y} ${el.z}`);
    es.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§d実行しました (clone)"}]}`);
  }
  if(e.id=="je:line"){
    drawLine(es,e.message?`minecraft:${e.message}`:"minecraft:stone");
    es.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§d実行しました (line)"}]}`);
  }
});

