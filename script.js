(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector("[data-theme-toggle]");
  const themeLabel = document.querySelector("[data-theme-label]");
  const themeAnnouncement = document.querySelector("[data-theme-announcement]");
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let storageAvailable = true;
  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem("theme");
  } catch {
    storageAvailable = false;
  }

  const initialTheme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
  root.dataset.theme = initialTheme;

  function updateThemeControl(theme) {
    const nextTheme = theme === "dark" ? "light" : "dark";

    if (themeColorMeta) {
      themeColorMeta.content = theme === "dark" ? "#090a12" : "#f0f3fa";
    }

    if (themeLabel) {
      themeLabel.textContent = `${nextTheme[0].toUpperCase()}${nextTheme.slice(1)} theme`;
    }

    if (themeButton) {
      themeButton.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
    }
  }

  updateThemeControl(initialTheme);

  if (!storageAvailable && themeAnnouncement) {
    themeAnnouncement.textContent = "Your browser is blocking saved theme preferences. Theme changes will apply to this page.";
  }

  document.querySelectorAll(".project-entry").forEach((entry) => {
    const label = entry.querySelector("[data-disclosure-label]");
    const updateDisclosureLabel = () => {
      if (label) {
        label.textContent = entry.open ? "Close" : "Explore";
      }
    };

    entry.addEventListener("toggle", updateDisclosureLabel);
    updateDisclosureLabel();
  });

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = nextTheme;
      updateThemeControl(nextTheme);

      try {
        localStorage.setItem("theme", nextTheme);
        if (themeAnnouncement) {
          themeAnnouncement.textContent = `${nextTheme[0].toUpperCase()}${nextTheme.slice(1)} theme selected and saved.`;
        }
      } catch {
        if (themeAnnouncement) {
          themeAnnouncement.textContent = `${nextTheme[0].toUpperCase()}${nextTheme.slice(1)} theme selected, but your browser could not save the preference.`;
        }
      }
    });
  }

  let scrollFrame = 0;
  function updateScrollProgress() {
    if (scrollFrame) {
      return;
    }

    scrollFrame = window.requestAnimationFrame(() => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? Math.min(window.scrollY / scrollableHeight, 1) : 0;
      root.style.setProperty("--scroll-progress", `${progress * 100}%`);
      scrollFrame = 0;
    });
  }

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);
  updateScrollProgress();

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (finePointer.matches && !reducedMotion.matches) {
    document.querySelectorAll("[data-magnetic]").forEach((control) => {
      control.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") {
          return;
        }

        const bounds = control.getBoundingClientRect();
        const offsetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 5;
        const offsetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 5;
        control.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      });

      control.addEventListener("pointerleave", () => {
        control.style.removeProperty("transform");
      });
    });
  }

  const field = document.querySelector("[data-circuit-field]");
  const canvas = field?.querySelector("[data-circuit-canvas]");
  const routeNodes = field ? [...field.querySelectorAll("[data-circuit-node]")] : [];
  const context = canvas?.getContext("2d");

  if (!field || !canvas || !context || routeNodes.length < 2) {
    return;
  }

  let activeNode = -1;
  let hoveredNode = -1;
  let focusedNode = -1;
  let isVisible = true;
  let animationFrame = 0;
  let latestTimestamp = 0;

  function circuitColors() {
    const styles = getComputedStyle(root);
    return {
      line: styles.getPropertyValue("--circuit").trim(),
      glow: styles.getPropertyValue("--circuit-glow").trim(),
      active: styles.getPropertyValue("--electrode").trim(),
    };
  }

  function getCircuitSegments() {
    const fieldBounds = field.getBoundingClientRect();
    const centers = routeNodes.map((node) => {
      const bounds = node.getBoundingClientRect();
      return {
        x: bounds.left + bounds.width / 2 - fieldBounds.left,
        y: bounds.top + bounds.height / 2 - fieldBounds.top,
      };
    });

    return centers.slice(1).map((end, index) => {
      const start = centers[index];
      const deltaX = end.x - start.x;
      const deltaY = end.y - start.y;
      const points = [start];

      if (Math.abs(deltaX) >= Math.abs(deltaY)) {
        const bendX = start.x + deltaX / 2;
        points.push({ x: bendX, y: start.y }, { x: bendX, y: end.y });
      } else {
        const bendY = start.y + deltaY / 2;
        points.push({ x: start.x, y: bendY }, { x: end.x, y: bendY });
      }

      points.push(end);
      return { points, index };
    });
  }

  function pointAtDistance(segments, distance) {
    for (const segment of segments) {
      for (let index = 1; index < segment.points.length; index += 1) {
        const start = segment.points[index - 1];
        const end = segment.points[index];
        const length = Math.hypot(end.x - start.x, end.y - start.y);

        if (distance <= length) {
          const ratio = length === 0 ? 0 : distance / length;
          return {
            x: start.x + (end.x - start.x) * ratio,
            y: start.y + (end.y - start.y) * ratio,
          };
        }

        distance -= length;
      }
    }

    return segments.at(-1)?.points.at(-1) ?? null;
  }

  function drawCircuit(timestamp = 0) {
    latestTimestamp = timestamp;
    const bounds = field.getBoundingClientRect();

    if (bounds.width === 0 || bounds.height === 0) {
      return;
    }

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const canvasWidth = Math.round(bounds.width * pixelRatio);
    const canvasHeight = Math.round(bounds.height * pixelRatio);

    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, bounds.width, bounds.height);

    const segments = getCircuitSegments();
    const colors = circuitColors();
    let totalLength = 0;

    for (const segment of segments) {
      context.beginPath();
      context.moveTo(segment.points[0].x, segment.points[0].y);

      for (let index = 1; index < segment.points.length; index += 1) {
        const start = segment.points[index - 1];
        const end = segment.points[index];
        totalLength += Math.hypot(end.x - start.x, end.y - start.y);
        context.lineTo(end.x, end.y);
      }

      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = activeNode === segment.index + 1 ? 2.5 : 1.5;
      context.strokeStyle = activeNode === segment.index + 1 ? colors.active : colors.line;
      context.shadowBlur = activeNode === segment.index + 1 ? 15 : 8;
      context.shadowColor = activeNode === segment.index + 1 ? colors.active : colors.glow;
      context.stroke();
    }

    context.shadowBlur = 0;

    if (!reducedMotion.matches && totalLength > 0) {
      const position = pointAtDistance(segments, (timestamp * 0.045) % totalLength);

      if (position) {
        context.beginPath();
        context.arc(position.x, position.y, 2.6, 0, Math.PI * 2);
        context.fillStyle = colors.active;
        context.shadowBlur = 14;
        context.shadowColor = colors.active;
        context.fill();
        context.shadowBlur = 0;
      }
    }
  }

  function shouldAnimate() {
    return !reducedMotion.matches && isVisible && document.visibilityState === "visible";
  }

  function animate(timestamp) {
    drawCircuit(timestamp);

    if (shouldAnimate()) {
      animationFrame = window.requestAnimationFrame(animate);
    } else {
      animationFrame = 0;
    }
  }

  function startCircuit() {
    drawCircuit(latestTimestamp);
    if (shouldAnimate() && !animationFrame) {
      animationFrame = window.requestAnimationFrame(animate);
    }
  }

  function stopCircuit() {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  }

  function updateActiveNode() {
    activeNode = focusedNode >= 0 ? focusedNode : hoveredNode;

    routeNodes.forEach((node, index) => {
      if (index === activeNode) {
        node.dataset.active = "true";
      } else {
        delete node.dataset.active;
      }
    });

    drawCircuit(latestTimestamp);
  }

  routeNodes.forEach((node, index) => {
    node.addEventListener("pointerenter", () => {
      hoveredNode = index;
      updateActiveNode();
    });
    node.addEventListener("pointerleave", () => {
      if (hoveredNode === index) {
        hoveredNode = -1;
        updateActiveNode();
      }
    });
    node.addEventListener("focus", () => {
      focusedNode = index;
      updateActiveNode();
    });
    node.addEventListener("blur", () => {
      if (focusedNode === index) {
        focusedNode = -1;
        updateActiveNode();
      }
    });
  });

  if ("ResizeObserver" in window) {
    new ResizeObserver(startCircuit).observe(field);
  } else {
    window.addEventListener("resize", startCircuit);
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        startCircuit();
      } else {
        stopCircuit();
      }
    }).observe(field);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      startCircuit();
    } else {
      stopCircuit();
    }
  });

  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      stopCircuit();
      drawCircuit(0);
    } else {
      startCircuit();
    }
  });

  new MutationObserver(() => drawCircuit(latestTimestamp))
    .observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  drawCircuit(0);
  startCircuit();
})();
