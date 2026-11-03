const decoys = document.querySelectorAll(".carouselDecoy")
const center = document.getElementById("centerCard")
const scroller = document.getElementById("scroller")

const cardWidth = center.computedStyleMap().get("width")
const cardMargin = center.computedStyleMap().get("margin-left")

const lineCount = 4
const lineHeight = center.querySelector("#description").clientHeight
const carouselCardData = []
let doneScrolling = true
let cardIndex = 0
;(async function () {
  try {
    const response = await fetch("./carousel.json")
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }
    const data = await response.json()
    data.forEach((item) => {
      carouselCardData.push(item)
    })
    setCardData(center)
    decoys.forEach((decoy) => {
      setCardData(decoy)
    })
  } catch (error) {
    console.error("Error loading carousel:", error)
  }
  return []
})()

function Scroll(left) {
  if (!doneScrolling) return
  else doneScrolling = false
  scroller.style.transition = ""
  if (left) {
    cardIndex -= 1
    if (cardIndex < 0) {
      cardIndex = carouselCardData.length - 1
    }

    scroller.style.left =
      -(2 * cardWidth.value + 3 * cardMargin.value) + cardWidth.unit
  } else {
    cardIndex += 1
    if (cardIndex >= carouselCardData.length) {
      cardIndex = 0
    }

    scroller.style.left = cardMargin.value + cardMargin.unit
  }

  setCardData(center)

  scroller.addEventListener("transitionend", () => {
    decoys.forEach((decoy) => {
      setCardData(decoy)
    })
    doneScrolling = true
  })
  setTimeout(
    () => {
      scroller.style.transition = "left 0.5s"
      scroller.style.left =
        -(cardWidth.value + cardMargin.value) + cardMargin.unit
    },
    { once: true }
  )
}
function setCardData(card) {
  const item = carouselCardData[cardIndex]
  card.querySelector("img").src = item.thumbnail
  card.querySelector("#title").firstChild.data = item.title
  let desc = card.querySelector("#description")
  desc.firstChild.data = item.description
  desc.className = desc.className.replace(" long", "")
  if (desc.clientHeight > lineCount * lineHeight) {
    desc.className += " long"
  }
  card.href = item.destination
}
