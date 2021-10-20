



export const timestampToTime = (seconds) => {
  let rtrn = ""
  let days = Math.floor(seconds / (3600*24));
  seconds  -= days*3600*24;
  let hrs   = Math.floor(seconds / 3600);
  seconds  -= hrs*3600;
  let minutes = Math.floor(seconds / 60);

  if (days >= 1){
    if (days > 1){
      rtrn += days+" Days"
    }
    else {
      rtrn += days+" Day"
    }
  }
  if (hrs >= 1){
    if (days >= 1){
      rtrn += ", "
    }
    if (hrs > 1){
      rtrn += hrs+" Hrs"
    }
    else{
      rtrn += hrs+" Hr"
    }
  }
  if (days < 1 || hrs < 1){
    if (hrs >= 1){
      rtrn += ", "
    }
    if (minutes > 1){
      rtrn +=  minutes+" Minutes"
    }
    else{
      rtrn += minutes+" Minute"
    }
  }

  return rtrn
}


export const timestampToDate = (ts) => {
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  //var timestamp = 1607110465663
  const date = new Date(ts)
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  const fullDate = month + " " + day + ", " + year
  //console.log(fullDate)
  return fullDate
}
