package com.mydreamshot

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.os.Bundle // 👈 Import Bundle for onCreate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Mydreamshot"

  // 👇 ADD THIS METHOD TO FIX THE THEME HANDOFF ISSUE
  override fun onCreate(savedInstanceState: Bundle?) {
    // 1. Set the MAIN application theme (AppTheme)
    // This switches from the temporary SplashTheme defined in AndroidManifest.xml
    setTheme(R.style.AppTheme)
    
    // 2. Call super.onCreate()
    super.onCreate(null) // Passing null is common for React Native activities
  }
  // 👆 END OF FIX

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}