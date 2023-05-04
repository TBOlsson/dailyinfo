// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: magic;
//url that has latest version: github.com/TBOlsson/dailyinfo

// update those two to determine payDay and id you want to use correct weekday names or not
const salaryDay = 25;
const useFunWeekdayNames = true;

//only needs to be updated if you want to change colours or font sizes
const firstBackgroundColor = "ff5a5a";
const secondBackgroundColor = "190a05";
const textColor = "ffffff";
const weekFontSize = 24;
const fontSize = 12;

// NO NEED TO CHANGE ANYTHING BELOW THIS, IF YOU EDITED THE VARIABLES ABOVE, YOU ONLY NEES TO UPDATE THE CODE BELOW
//------------------------------------------

// PATCH NOTES
//1.3.2 changed layout and implemented version control
//1.3.1 added salaryDay variable since pension and some region employees dont get paid 25th
//1.3.0 added daily quote
//1.2.0 added days until next salary
//1.1.0 broke out hardcoded into functions
//1.0.0 Made script

const thisVersion = "1.3.2";

const widget = await createWidget(thisVersion);

config.runsInWidget ? Script.setWidget(widget) : widget.presentMedium();

Script.complete();

async function createWidget(currentVerion) {
  const latestVersion = await getLatestVersion();
  const quote = await getRandomDailyQuote();
  let lw = new ListWidget();

  let gradient = new LinearGradient();
  gradient.colors = [
    new Color(firstBackgroundColor),
    new Color(secondBackgroundColor),
  ];
  gradient.locations = [
    0,
    1,
  ];
  gradient.startPoint = new Point(0, 0)
  gradient.endPoint = new Point(1, 1)

  lw.backgroundGradient = gradient;

  let d = new Date();
  d.setHours(d.getHours() + 24);
  lw.refreshAfterDate = d;

  if (currentVerion < latestVersion) {

    addWidgetText(
      `There seems to be a newer version of this script to be downloaded. \n\nCurrent version: ${currentVerion} \nLatest version: ${latestVersion} \nGo to Scriptable to get an url to get the latest version`, 
      lw, 
      fontSize, 
      textColor
    );

    return lw

  } else {
    addWidgetText(
      `Vecka: ${getWeek()}`,
      lw,
      weekFontSize,
      textColor
    );
    lw.addSpacer(10);

    addWidgetText(
      `${formatDate()} - ${getWeekday(new Date(), useFunWeekdayNames)}`,
      lw,
      fontSize,
      textColor
    );
    lw.addSpacer(5);

    addWidgetText(
      daysUntilNextSalary(new Date(), salaryDay),
      lw,
      fontSize,
      textColor
    );
    lw.addSpacer(5);

    addWidgetText(
      quote,
      lw,
      10,
      textColor
    );

    return lw;
  }
}

function addWidgetText(text, widget, fontSize = 10, textColor = "black") {
  let wid = widget.addText(text.toString());
  wid.centerAlignText();
  wid.font = Font.lightSystemFont(fontSize);
  wid.textColor = new Color(textColor);
  return wid
}

async function getRandomDailyQuote() {
  let quote = await new Request(`https://script.google.com/macros/s/AKfycbzvzWg-eubFOqYrCS0SuggOjqjJmqasJG0tN3uP6XAgumI1GmOMN1cEDY_eOylRQk1L/exec`).loadString();
  quote = JSON.parse(quote);
  quote = quote["Your random quote of the day is:"]
  return quote
}

async function getLatestVersion() {
  let version = await new Request(`https://script.google.com/macros/s/AKfycbzvzWg-eubFOqYrCS0SuggOjqjJmqasJG0tN3uP6XAgumI1GmOMN1cEDY_eOylRQk1L/exec`).loadString();
  version = JSON.parse(version);
  version = version["LatestVersion"]
  return version
}

function daysUntilNextSalary(date = new Date(), salaryDay = 25) {
  const today = new Date(date);
  const currentDay = today.getDate();

  if (currentDay === salaryDay) {
    return "LÖN IDAG!! 💰🤑";
  }

  const salaryMonth = (currentDay > salaryDay) ? today.getMonth() + 1 : today.getMonth();
  salaryDay = new Date(today.getFullYear(), salaryMonth, salaryDay);
  const dayOfWeek = salaryDay.getDay();

  // If salary day is a Saturday or Sunday, set it to the Friday before
  if (dayOfWeek === 6) {
    salaryDay.setDate(salaryDay.getDate() - 1);
  } else if (dayOfWeek === 0) {
    salaryDay.setDate(salaryDay.getDate() - 2);
  }

  const daysUntil = Math.ceil((salaryDay - today) / (1000 * 60 * 60 * 24));
  return daysUntil == 1 ? `${daysUntil} dag till lön` : `${daysUntil} dagar till lön`
}

function getWeekday(date = new Date(), toggleFunNames = true) {
  let wd = new Date(date).getDay();

  switch (wd) {
    case 1:
      wd = "Måndag";
      break;
    case 2:
      wd = toggleFunNames ? "Lill-fredag" : "Tisdag";
      break;
    case 3:
      wd = toggleFunNames ? "Lill-lördag" : "Onsdag";
      break;
    case 4:
      wd = toggleFunNames ? "För-fredag" : "Torsdag";
      break;
    case 5:
      wd = "Fredag";
      break;
    case 6:
      wd = "Lördag";
      break;
    case 0:
      wd = "Söndag";
      break;
    default:
      wd = "Dagen efter igår, och innan imorgon";
      break;
  }
  return wd
}

function getWeek(date = new Date()) {
  //function to get ISO8601 week
  let tdt = new Date(date.valueOf());
  const dayn = (new Date(date).getDay() + 6) % 7;
  tdt.setDate(tdt.getDate() - dayn + 3);
  const firstThursday = tdt.valueOf();
  tdt.setMonth(0, 1);

  if (tdt.getDay() !== 4) {
    tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
  }
  let weekNum = 1 + Math.ceil((firstThursday - tdt) / 604800000);
  return weekNum < 10 ? "0" + weekNum : weekNum;
}

function formatDate(date = new Date()) {
  let d = new Date(date);
  let year = d.getFullYear();
  let month = d.getMonth() + 1;
  let day = d.getDate();

  month = month < 10 ? `0${month}` : month;
  day = day < 10 ? `0${day}` : day;

  return `${year}-${month}-${day}`
}
